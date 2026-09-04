import { createHash } from "crypto";
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

export interface InitResult {
  url: string;
  invId: string;
}

let azvoxOrderCounter = 0;
let azvoxOrderLastSec = -1;

/**
 * Генерация целочисленного m_orderid для Azvox.
 * Azvox хранит номер заказа в колонке INT (тип int32, максимум 2 147 483 647),
 * поэтому значение обязано умещаться в этот диапазон. Прежняя реализация склеивала
 * 8-значный хвост timestamp с 3-значным счётчиком и могла выдать 11-значное число,
 * которое Azvox усекал до 2147483647. В колбэке тогда приходил чужой m_orderid,
 * заказ не находился и платёж не зачислялся («Ошибка ответа — Azvox не получил ответ»).
 *
 * Новая реализация: база из секунд epoch по модулю 2 000 000 (период ~23 дня) плюс
 * двузначный инкрементный счётчик. Итог всегда строго меньше 2^31 и уникален
 * в пределах окна.
 */
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

/**
 * Начисление баланса после подтверждённого callback.
 * Если actualAmount передан, используется фактически оплаченная сумма.
 *
 * Возвращает boolean:
 *  - true  — платёж обработан (или уже был обработан);
 *  - false — платёж не удалось обработать (БД недоступна либо запись не найдена),
 *            при этом причина детально логируется.
 * Любое исключение при записи/начислении пробрасывается наружу (после
 * логирования), чтобы обработчик мог вернуть «|error» и Azvox повторил запрос.
 */
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
        const updated = await updateAdvertiserBalance(
          payment.advertiserId,
          amount
        );
        if (!updated) {
          console.error(
            `[payment:${method}] платёж ${paymentId}: рекламодатель ${payment.advertiserId} не найден или баланс не обновлён`
          );
        } else {
          console.info(
            `[payment:${method}] платёж ${paymentId}: баланс рекламодателя ${payment.advertiserId} увеличен на ${amount}, итог ${updated.balance}`
          );
        }

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
  // m_desc и m_params передаются в base64, как требует метод pay/.
  const m_desc = Buffer.from(desc, "utf8").toString("base64");
  // По документации m_params = base64_encode(json_encode(false)) =
  // base64("false"). m_params не включается в GET-ссылку, но участвует
  // в расчёте подписи.
  const m_params = Buffer.from("false", "utf8").toString("base64");

  // Подпись считается по base64-значениям m_desc и m_params.
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

/**
 * Порядок полей, участвующих в подписи Status URL Azvox (SHA256).
 * Поля склеиваются через ':', в конце добавляется секретный ключ.
 */
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

/**
 * Собирает варианты ожидаемой подписи Status URL Azvox.
 *
 * Канонический порядок полей описан в AZVOX_STATUS_FIELDS. Известная неоднозначность
 * Azvox: если m_params в callback пуст или опущен, подпись может считаться как с
 * пустым сегментом («...m_desc::secret»), так и без него («...m_desc:secret»).
 * Поэтому генерируются несколько кандидатов — любой из них принимается проверкой.
 */
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

  // Канонический вариант: все поля, пустые значения как пустой сегмент.
  add(values, "canonical");

  // Вариант без m_params: некоторые версии Azvox опускают m_params из подписи.
  add(values.slice(0, AZVOX_STATUS_FIELDS.length - 1), "without-m_params");

  // Вариант с отбрасыванием хвостовых пустых полей перед секретом.
  const trimmed = [...values];
  while (trimmed.length > 0 && trimmed[trimmed.length - 1] === "") {
    trimmed.pop();
  }
  if (trimmed.length !== values.length) {
    add(trimmed, `trailing-trim(${values.length}->${trimmed.length})`);
  }

  return Array.from(byHash.values());
}

/**
 * Проверка подписи Status URL Azvox (SHA256).
 * Возвращает true, если хотя бы один вариант ожидаемой подписи совпал с
 * пришедшей m_signature. Секретные ключи в логи не попадают — логируются только
 * значения полей callback, пришедшая подпись и хэш ожидаемых вариантов.
 */
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

/** Значения callback для логов без m_signature (секретов в callback нет). */
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

export class PaymentNotConfiguredError extends Error {
  constructor() {
    super("Payment system not configured");
    this.name = "PaymentNotConfiguredError";
  }
}
