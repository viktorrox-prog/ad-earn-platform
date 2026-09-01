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

  if (status !== "success" && status !== "paid") {
    return new NextResponse(`${orderId}|success`, { status: 200 });
  }

  if (!verifyAzvoxSignature(params)) {
    return new NextResponse("invalid signature", { status: 403 });
  }

  const actualAmount = parseFloat(
    params.m_operation_amount ?? params.m_amount ?? "0"
  );

  await processPaymentCallback(
    orderId,
    "azvox",
    "Azvox",
    Number.isFinite(actualAmount) && actualAmount > 0 ? actualAmount : undefined
  );

  return new NextResponse(`${orderId}|success`, { status: 200 });
}
