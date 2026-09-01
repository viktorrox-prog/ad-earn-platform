import { NextRequest, NextResponse } from "next/server";
import {
  verifyFreekassaCallback,
  processPaymentCallback,
} from "@/lib/payments";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const merchantId = String(formData.get("MERCHANT_ID") ?? "");
  const amountStr = String(formData.get("AMOUNT") ?? "");
  const invId = String(formData.get("INV_ID") ?? "");
  const signature = String(formData.get("SIGN") ?? "");

  const expectedMerchantId = process.env.FREEKASSA_MERCHANT_ID;

  if (!invId || !amountStr || !signature) {
    return new NextResponse("bad request", { status: 400 });
  }

  if (expectedMerchantId && merchantId !== expectedMerchantId) {
    return new NextResponse("merchant mismatch", { status: 403 });
  }

  if (!verifyFreekassaCallback(merchantId, amountStr, invId, signature)) {
    return new NextResponse("invalid signature", { status: 403 });
  }

  const actualAmount = parseFloat(amountStr);
  await processPaymentCallback(
    invId,
    "freekassa",
    "FreeKassa",
    Number.isFinite(actualAmount) && actualAmount > 0 ? actualAmount : undefined
  );

  return new NextResponse("YES");
}
