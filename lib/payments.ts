import { createHash } from "crypto";
import { randomUUID } from "crypto";
import { isDatabaseAvailable } from "@/lib/db";
import {
  createPayment,
  createTransaction,
  creditReferralReward,
  getAdvertiserById,
  getPaymentById,
  updateAdvertiserBalance,
  updatePaymentStatus,
} from "@/lib/models";
import type { PaymentInitInput } from "@/lib/validation/payment";

export function sha256(data: string): string {
  return createHash("sha256").update(data).digest("hex");
}

export function md5(data: string): string {
  return createHash("md5").update(data).digest("hex");
}

export interface InitResult {
  url: string;
  invId: string;
}

export async function processPaymentCallback(
  paymentId: string,
  method: string,
  label: string,
  actualAmount?: number
): Promise<boolean> {
  const dbAvailable = await isDatabaseAvailable();
  if (!dbAvailable) return false;

  const payment = await getPaymentById(paymentId);
  if (!payment) return false;

  if (payment.status !== "pending") return true;

  await updatePaymentStatus(paymentId, "success");

  const amount = actualAmount ?? payment.amount;

  if (payment.userId) {
    await createTransaction({
      userId: payment.userId,
      type: "deposit",
      amount,
      description: `Пополнение через ${label}`,
      status: "completed",
    });
  }

  if (payment.advertiserId) {
    const advertiser = await getAdvertiserById(payment.advertiserId);
    if (advertiser) {
      const newBalance = advertiser.balance + amount;
      await updateAdvertiserBalance(payment.advertiserId, newBalance);

      if (advertiser.referredBy) {
        await creditReferralReward(
          advertiser.referredBy,
          amount,
          advertiser.companyName
        );
      }
    }
  }

  return true;
}

export async function createAzvoxPayment(
  input: PaymentInitInput
): Promise<InitResult> {
  const wallet = process.env.AZVOX_WALLET;
  const shopId = process.env.AZVOX_SHOP_ID;
  const apiId = process.env.AZVOX_API_ID;
  const apiPass = process.env.AZVOX_API_PASS;

  if (!wallet || !shopId || !apiId || !apiPass) {
    throw new PaymentNotConfiguredError();
  }

  const orderId = randomUUID();

  const form = new URLSearchParams();
  form.set("account", wallet);
  form.set("apiId", apiId);
  form.set("apiPass", apiPass);
  form.set("action", "new_invoice");
  form.set("m_shop", shopId);
  form.set("m_orderid", orderId);
  form.set("m_amount", input.amount.toFixed(2));
  form.set("m_curr", "RUB");
  form.set("m_desc", "Пополнение баланса AdEarn");

  const response = await fetch("https://azvox.cash/api/v3.6/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  });

  if (!response.ok) {
    throw new Error("Azvox API error");
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new Error("Azvox API invalid response");
  }

  const url = extractInvoiceUrl(data);
  if (!url) {
    throw new Error("Azvox invoice url not found");
  }

  const dbAvailable = await isDatabaseAvailable();
  if (dbAvailable) {
    await createPayment({
      id: orderId,
      userId: input.userId || undefined,
      advertiserId: input.advertiserId || undefined,
      amount: input.amount,
      method: "azvox",
      status: "pending",
      description: "Пополнение через Azvox",
    });
  }

  return { url, invId: orderId };
}

function extractInvoiceUrl(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const obj = data as Record<string, unknown>;
  const candidates = [
    "url",
    "link",
    "pay_url",
    "payment_url",
    "redirect",
    "invoice_url",
  ];
  for (const key of candidates) {
    const value = obj[key];
    if (typeof value === "string" && value.length > 0) return value;
  }
  if (obj.result && typeof obj.result === "object") {
    const inner = extractInvoiceUrl(obj.result);
    if (inner) return inner;
  }
  if (obj.data && typeof obj.data === "object") {
    const inner = extractInvoiceUrl(obj.data);
    if (inner) return inner;
  }
  return null;
}

export function verifyAzvoxSignature(params: Record<string, string>): boolean {
  const secret = process.env.AZVOX_SECRET_KEY;
  if (!secret) return false;

  const signature = params.m_signature ?? params.signature;
  if (!signature) return false;

  const raw = [
    params.m_status,
    params.m_operation_id,
    params.m_operation_amount,
    params.m_operation_curr,
    params.m_operation_timestamp,
    params.m_wallet,
    params.m_shop,
    params.m_orderid,
    params.m_amount,
    params.m_curr,
    params.m_desc,
    params.m_params,
    secret,
  ]
    .map((v) => (v == null ? "" : v))
    .join(":");

  const expected = sha256(raw);
  return expected.toLowerCase() === signature.toLowerCase();
}

export async function createFreekassaPayment(
  input: PaymentInitInput,
  baseUrl: string
): Promise<InitResult> {
  const merchantId = process.env.FREEKASSA_MERCHANT_ID;
  const secret1 = process.env.FREEKASSA_SECRET1;

  if (!merchantId || !secret1) {
    throw new PaymentNotConfiguredError();
  }

  const invId = randomUUID();

  const dbAvailable = await isDatabaseAvailable();
  if (dbAvailable) {
    await createPayment({
      id: invId,
      userId: input.userId || undefined,
      advertiserId: input.advertiserId || undefined,
      amount: input.amount,
      method: "freekassa",
      status: "pending",
      description: "Пополнение через FreeKassa",
    });
  }

  const url = `${baseUrl}/api/payment/freekassa/pay?invId=${encodeURIComponent(invId)}`;
  return { url, invId };
}

export function freekassaFormSignature(
  merchantId: string,
  amount: string,
  invId: string
): string {
  const secret1 = process.env.FREEKASSA_SECRET1 ?? "";
  return md5(`${merchantId}:${amount}:${secret1}:${invId}`);
}

export function verifyFreekassaCallback(
  merchantId: string,
  amount: string,
  invId: string,
  signature: string
): boolean {
  const secret2 = process.env.FREEKASSA_SECRET2 ?? "";
  const expected = md5(`${merchantId}:${amount}:${secret2}:${invId}`);
  return expected.toLowerCase() === signature.toLowerCase();
}

export class PaymentNotConfiguredError extends Error {
  constructor() {
    super("Payment system not configured");
    this.name = "PaymentNotConfiguredError";
  }
}
