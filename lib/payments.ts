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

/**
 * Генерация целочисленного m_orderid для Azvox.
 * Azvox требует тип Int(11), поэтому возвращаем строку до 11 цифр.
 * Значение строится из хвоста timestamp и инкрементного счётчика для уникальности.
 */
export function nextAzvoxOrderId(): string {
  const ts = Date.now() % 100_000_000;
  azvoxOrderCounter = (azvoxOrderCounter + 1) % 1_000;
  return `${ts}${String(azvoxOrderCounter).padStart(3, "0")}`;
}

/**
 * Начисление баланса после подтверждённого callback.
 * Если actualAmount передан, используется фактически оплаченная сумма.
 */
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

/**
 * Создание счёта в Azvox прямым способом "С полным контролем":
 * формируется готовая ссылка на форму оплаты https://azvox.cash/pay/.
 * Используется только секретный ключ сайта AZVOX_SECRET_KEY,
 * без авторизации через account/apiId/apiPass.
 * https://azvox.cash/demo/direct_form.php
 */
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

/** Проверка подписи Status URL Azvox (SHA256). */
export function verifyAzvoxSignature(params: Record<string, string>): boolean {
  const secret = process.env.AZVOX_SECRET_KEY?.trim();
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

/**
 * Формирование ссылки на форму оплаты FreeKassa.
 * Возвращает URL внутреннего маршрута, который отдаёт самоотправляющуюся форму.
 */
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

/**
 * Подпись формы оплаты FreeKassa SCI (секретное слово 1).
 * По документации: md5("m:oa:Секретное слово 1:currency:o").
 */
export function freekassaFormSignature(
  merchantId: string,
  amount: string,
  invId: string,
  currency = "RUB"
): string {
  const secret1 = process.env.FREEKASSA_SECRET1?.trim() ?? "";
  return md5(`${merchantId}:${amount}:${secret1}:${currency}:${invId}`);
}

/** Проверка подписи callback FreeKassa (секретное слово 2). */
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
