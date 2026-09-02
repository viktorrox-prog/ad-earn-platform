import { NextRequest, NextResponse } from "next/server";
import { isDatabaseAvailable } from "@/lib/db";
import { getPaymentById } from "@/lib/models";
import { freekassaFormSignature } from "@/lib/payments";

const PAYMENT_URL = "https://pay.fk.money/";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const invId = searchParams.get("invId");
  const merchantId = process.env.FREEKASSA_MERCHANT_ID;

  if (!invId || !merchantId) {
    return new NextResponse("Invalid payment", { status: 400 });
  }

  let amount: number;
  let userId = "";
  let advertiserId = "";

  if (await isDatabaseAvailable()) {
    const payment = await getPaymentById(invId);
    if (!payment || payment.status !== "pending") {
      return new NextResponse("Payment not found", { status: 404 });
    }
    amount = payment.amount;
    userId = payment.userId ?? "";
    advertiserId = payment.advertiserId ?? "";
  } else {
    amount = parseFloat(searchParams.get("amount") ?? "0");
  }

  if (!amount || amount <= 0) {
    return new NextResponse("Invalid amount", { status: 400 });
  }

  const amountStr = amount.toFixed(2);
  const currency = "RUB";
  const sign = freekassaFormSignature(merchantId, amountStr, invId, currency);

  const query = new URLSearchParams({
    m: merchantId,
    oa: amountStr,
    o: invId,
    currency,
    lang: "ru",
    s: sign,
    us_userId: userId,
    us_advertiserId: advertiserId,
  });

  const payUrl = `${PAYMENT_URL}?${query.toString()}`;
  return NextResponse.redirect(new URL(payUrl), 307);
}
