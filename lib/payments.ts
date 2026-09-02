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

let azvoxOrderCounter = 0;
let azvoxOrderLastSec = -1;

export function nextAzvoxOrderId(): string {
  const sec = Math.floor(Date.now() / 1000) % 2_000_000; // 0..1 999 999
  if (sec !== azvoxOrderLastSec) {
    azvoxOrderLastSec = sec;
    azvoxOrderCounter = 0;
  } else {
    azvoxOrderCounter = (azvoxOrderCounter + 1) % 100;
  }
  return String(sec * 100 + azvoxOrderCounter);
}

export async function processPaymentCallback(
  paymentId: string,
  method: string,
  label: string,
  actualAmount?: number
): Promise<boolean> {
  try {
    const dbAvailable = await isDatabaseAvailable();
    if (!dbAvailable) {
      console.error(
        `[payment:${method}] платёж ${paymentId}: БД недоступна, начисление пропущено`
      );
      return false;
    }

    const payment = await getPaymentById(paymentId);
    if (!payment) {
      console.error(
        `[payment:${method}] платёж ${paymentId}: запись не найдена в таблице payments`
      );
      return false;
    }

    if (payment.status !== "pending") {
      console.warn(
        `[payment:${method}] платёж ${paymentId}: статус "${payment.status}" (не pending), повторная обработка пропущена`
      );
      return true;
    }

    await updatePaymentStatus(paymentId, "success");
    const amount = actualAmount ?? payment.amount;
    console.info(
      `[payment:${method}] платёж ${paymentId}: переведён в success, начисляемая сумма=${amount}`
    );

    if (payment.userId) {
      await createTransaction({
        userId: payment.userId,
        type: "deposit",
        amount,
        description: `Пополнение через ${label}`,
        status: "completed",
      });
      console.info(
        `[payment:${method}] платёж ${paymentId}: создана транзакция deposit для userId=${payment.userId}`
      );
    }

    if (payment.advertiserId) {
      const advertiser = await getAdvertiserById(payment.advertiserId);
      if (!advertiser) {
        console.error(
          `[payment:${method}] платёж ${paymentId}: рекламодатель ${payment.advertiserId} не найден`
        );
      } else {
        const newBalance = advertiser.balance + amount;
        await updateAdvertiserBalance(payment.advertiserId, newBalance);
        console.info(
          `[payment:${method}] платёж ${paymentId}: баланс рекламодателя ${payment.advertiserId} обновлён до ${newBalance}`
        );

        if (advertiser.referredBy) {
          await creditReferralReward(
            advertiser.referredBy,
            amount,
            advertiser.companyName
          );
          console.info(
            `[payment:${method}] платёж ${paymentId}: начислена партнёрская комиссия referrer=${advertiser.referredBy}`
          );
        }
      }
    }

    return true;
  } catch (err) {
    console.error(
      `[payment:${method}] платёж ${paymentId}: исключение при начислении:`,
      err
    );
    throw err;
  }
}

export async function createAzvoxPayment(
  input: PaymentInitInput
): Promise<InitResult> {
  const shopId = process.env.AZVOX_SHOP_ID?.trim();
  const secret = process.env.AZVOX_SECRET_KEY?.trim();

  if (!shopId || !secret) {
    throw new PaymentNotConfiguredError();
  }

  const orderId = nextAzvoxOrderId();
  const amount = input.amount.toFixed(2);

  const desc = "Пополнение баланса AdEarn";
  const m_desc = Buffer.from(desc, "utf8").toString("base64");
  const m_params = Buffer.from("false", "utf8").toString("base64");

  const signRaw = [
    shopId,
    orderId,
    amount,
    "RUB",
    m_desc,
    m_params,
    secret,
  ].join(":");
  const m_sign = sha256(signRaw).toUpperCase();

  const query = new URLSearchParams({
    m_shop: shopId,
    m_orderid: orderId,
    m_amount: amount,
    m_curr: "RUB",
    m_desc,
    m_sign,
  });
  const url = `https://azvox.cash/pay/?${query.toString()}`;

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

const AZVOX_STATUS_FIELDS: readonly string[] = [
  "m_status",
  "m_operation_id",
  "m_operation_amount",
  "m_operation_curr",
  "m_operation_timestamp",
  "m_wallet",
  "m_shop",
  "m_orderid",
  "m_amount",
  "m_curr",
  "m_desc",
  "m_params",
];

interface AzvoxSignatureCandidate {
  label: string;
  hash: string;
}

function buildAzvoxSignatureCandidates(
  params: Record<string, string>,
  secret: string
): AzvoxSignatureCandidate[] {
  const values = AZVOX_STATUS_FIELDS.map((k) => params[k] ?? "");
  const byHash = new Map<string, AzvoxSignatureCandidate>();

  const add = (arr: string[], label: string) => {
    const hash = sha256([...arr, secret].join(":"));
    if (!byHash.has(hash)) byHash.set(hash, { label, hash });
  };

  add(values, "canonical");
  add(values.slice(0, AZVOX_STATUS_FIELDS.length - 1), "without-m_params");

  const trimmed = [...values];
  while (trimmed.length > 0 && trimmed[trimmed.length - 1] === "") {
    trimmed.pop();
  }
  if (trimmed.length !== values.length) {
    add(trimmed, `trailing-trim(${values.length}->${trimmed.length})`);
  }

  return Array.from(byHash.values());
}

export function verifyAzvoxSignature(params: Record<string, string>): boolean {
  const secret = process.env.AZVOX_SECRET_KEY?.trim();
  const signature = params.m_sign ?? params.m_signature ?? params.signature;

  if (!secret || !signature) {
    console.error(
      `[azvox-status] подпись не проверена: секрет не задан (${!secret}), m_signature отсутствует (${!signature})`
    );
    return false;
  }

  const candidates = buildAzvoxSignatureCandidates(params, secret);
  const received = signature.toLowerCase();

  for (const candidate of candidates) {
    if (candidate.hash.toLowerCase() === received) return true;
  }

  console.error(
    `[azvox-status] подпись НЕ сошлась. m_orderid=${params.m_orderid}, ` +
      `m_status=${params.m_status}. Пришло signature=${signature}. ` +
      `Ожидаемые варианты (hash): ${candidates
        .map((c) => `${c.label}=${c.hash}`)
        .join(", ")}. ` +
      `Поля callback: ${JSON.stringify(sanitizeAzvoxParams(params))}`
  );
  return false;
}

function sanitizeAzvoxParams(
  params: Record<string, string>
): Record<string, string> {
  const copy: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (key.toLowerCase() === "m_sign") continue;
    if (key.toLowerCase().includes("signature")) continue;
    copy[key] = value;
  }
  return copy;
}

export async function createFreekassaPayment(
  input: PaymentInitInput,
  baseUrl: string
): Promise<InitResult> {
  const merchantId = process.env.FREEKASSA_MERCHANT_ID?.trim();
  const secret1 = process.env.FREEKASSA_SECRET1?.trim();

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
  invId: string,
  currency = "RUB"
): string {
  const secret1 = process.env.FREEKASSA_SECRET1?.trim() ?? "";
  return md5(`${merchantId}:${amount}:${secret1}:${currency}:${invId}`);
}

export function verifyFreekassaCallback(
  merchantId: string,
  amount: string,
  invId: string,
  signature: string
): boolean {
  const secret2 = process.env.FREEKASSA_SECRET2?.trim() ?? "";
  const expected = md5(`${merchantId}:${amount}:${secret2}:${invId}`);
  return expected.toLowerCase() === signature.toLowerCase();
}

export class PaymentNotConfiguredError extends Error {
  constructor() {
    super("Payment system not configured");
    this.name = "PaymentNotConfiguredError";
  }
}
