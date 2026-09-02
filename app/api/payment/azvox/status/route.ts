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

  if (!orderId) {
    return new NextResponse("bad request", { status: 400 });
  }

  // Неуспешный статус: подтверждаем получение корректным текстом `{m_orderid}|success`,
  // чтобы Azvox не считал ответ ошибочным, но ничего не начисляем.
  if (status !== "success" && status !== "paid") {
    return new NextResponse(`${orderId}|success`, { status: 200 });
  }

  // Успешный статус: сначала проверяем подпись SHA256.
  if (!verifyAzvoxSignature(params)) {
    return new NextResponse(`${orderId}|error`, { status: 200 });
  }

  try {
    await processPaymentCallback(
      orderId,
      "azvox",
      "Azvox",
      Number.isFinite(Number(params.m_operation_amount)) &&
        Number(params.m_operation_amount) > 0
        ? Number(params.m_operation_amount)
        : undefined
    );
  } catch {
    // Возвращаем `{m_orderid}|error`, чтобы Azvox повторил запрос позже.
    return new NextResponse(`${orderId}|error`, { status: 200 });
  }

  return new NextResponse(`${orderId}|success`, { status: 200 });
}
