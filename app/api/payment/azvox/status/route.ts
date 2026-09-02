import { NextRequest, NextResponse } from "next/server";
import { verifyAzvoxSignature, processPaymentCallback } from "@/lib/payments";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const params: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    params[key] = String(value);
  }

  const orderId = params.m_orderid;
  const status = params.m_status;

  console.info(
    `[azvox-status] получен callback. m_orderid=${orderId}, m_status=${status}, ` +
      `m_operation_id=${params.m_operation_id}, m_amount=${params.m_amount}, ` +
      `m_operation_amount=${params.m_operation_amount}`
  );

  if (!orderId) {
    console.error("[azvox-status] отсутствует m_orderid в callback");
    return new NextResponse("bad request", { status: 400 });
  }

  // Неуспешный статус: подтверждаем получение корректным текстом `{m_orderid}|success`,
  // чтобы Azvox не считал ответ ошибочным, но ничего не начисляем.
  if (status !== "success" && status !== "paid") {
    console.warn(
      `[azvox-status] статус "${status}" не является успешным, начисление пропущено`
    );
    return new NextResponse(`${orderId}|success`, { status: 200 });
  }

  // Успешный статус: сначала проверяем подпись SHA256.
  // Причина отказа подробно логируется внутри verifyAzvoxSignature.
  if (!verifyAzvoxSignature(params)) {
    return new NextResponse(`${orderId}|error`, { status: 200 });
  }

  const actualAmount =
    Number.isFinite(Number(params.m_operation_amount)) &&
    Number(params.m_operation_amount) > 0
      ? Number(params.m_operation_amount)
      : undefined;

  try {
    const processed = await processPaymentCallback(
      orderId,
      "azvox",
      "Azvox",
      actualAmount
    );

    if (!processed) {
      // БД недоступна либо платёж не найден — возвращаем `|error`, чтобы Azvox
      // повторил запрос позже. Причина уже залогирована в processPaymentCallback.
      console.error(
        `[azvox-status] платёж ${orderId} не обработан (БД недоступна или не найден)`
      );
      return new NextResponse(`${orderId}|error`, { status: 200 });
    }
  } catch (err) {
    // Возвращаем `{m_orderid}|error`, чтобы Azvox повторил запрос позже.
    // Текст ошибки уже залогирован в processPaymentCallback.
    console.error(
      `[azvox-status] исключение при начислении платёжа ${orderId}:`,
      err
    );
    return new NextResponse(`${orderId}|error`, { status: 200 });
  }

  return new NextResponse(`${orderId}|success`, { status: 200 });
}
