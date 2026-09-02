import { NextRequest, NextResponse } from "next/server";
import {
  verifyFreekassaCallback,
  processPaymentCallback,
} from "@/lib/payments";

function handleCallback(params: {
  merchantId: string;
  amountStr: string;
  invId: string;
  signature: string;
}): Promise<NextResponse> {
  const expectedMerchantId = process.env.FREEKASSA_MERCHANT_ID;

  const { merchantId, amountStr, invId, signature } = params;

  if (!invId || !amountStr || !signature) {
    return Promise.resolve(new NextResponse("bad request", { status: 400 }));
  }

  if (expectedMerchantId && merchantId !== expectedMerchantId) {
    return Promise.resolve(
      new NextResponse("merchant mismatch", { status: 403 })
    );
  }

  if (!verifyFreekassaCallback(merchantId, amountStr, invId, signature)) {
    return Promise.resolve(
      new NextResponse("invalid signature", { status: 403 })
    );
  }

  const actualAmount = parseFloat(amountStr);
  return processPaymentCallback(
    invId,
    "freekassa",
    "FreeKassa",
    Number.isFinite(actualAmount) && actualAmount > 0 ? actualAmount : undefined
  ).then(() => new NextResponse("YES"));
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const merchantId = String(formData.get("MERCHANT_ID") ?? "");
  const amountStr = String(formData.get("AMOUNT") ?? "");
  const invId = String(
    formData.get("MERCHANT_ORDER_ID") ?? formData.get("INV_ID") ?? ""
  );
  const signature = String(formData.get("SIGN") ?? "");

  return handleCallback({ merchantId, amountStr, invId, signature });
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const merchantId = String(searchParams.get("MERCHANT_ID") ?? "");
  const amountStr = String(searchParams.get("AMOUNT") ?? "");
  const invId = String(
    searchParams.get("MERCHANT_ORDER_ID") ?? searchParams.get("INV_ID") ?? ""
  );
  const signature = String(searchParams.get("SIGN") ?? "");

  return handleCallback({ merchantId, amountStr, invId, signature });
}
