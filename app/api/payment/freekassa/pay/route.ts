import { NextRequest, NextResponse } from "next/server";
import { isDatabaseAvailable } from "@/lib/db";
import { getPaymentById } from "@/lib/models";
import { freekassaFormSignature } from "@/lib/payments";

const PAYMENT_URL = "https://pay.freekassa.com/";

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
  const sign = freekassaFormSignature(merchantId, amountStr, invId);

  const hiddenFields = [
    ["MERCHANT_ID", merchantId],
    ["AMOUNT", amountStr],
    ["INV_ID", invId],
    ["CURRENCY", "RUB"],
    ["SIGN", sign],
    ["US_userId", userId],
    ["US_advertiserId", advertiserId],
  ]
    .map(
      ([name, value]) =>
        `<input type="hidden" name="${escapeHtml(name)}" value="${escapeHtml(value)}" />`
    )
    .join("\n");

  const html = `<!DOCTYPE html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <title>Переход на оплату FreeKassa</title>
  </head>
  <body onload="document.getElementById('fk-form').submit()">
    <p>Перенаправляем на платёжную страницу FreeKassa…</p>
    <form id="fk-form" action="${escapeHtml(PAYMENT_URL)}" method="POST">
      ${hiddenFields}
      <noscript>
        <button type="submit">Перейти к оплате</button>
      </noscript>
    </form>
  </body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
