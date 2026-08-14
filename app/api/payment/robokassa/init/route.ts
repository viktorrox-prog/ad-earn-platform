import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createHash } from "crypto";
import { robokassaInitSchema } from "@/lib/validation/payment";
import { isDatabaseAvailable } from "@/lib/db";
import { createPayment } from "@/lib/models";

function md5(data: string): string {
  return createHash("md5").update(data).digest("hex");
}

export async function POST(request: NextRequest) {
  const parsed = robokassaInitSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Некорректные данные", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { userId, advertiserId, amount } = parsed.data;

  if (!userId && !advertiserId) {
    return NextResponse.json(
      { error: "Укажите userId или advertiserId" },
      { status: 400 }
    );
  }

  const merchantLogin = process.env.ROBOKASSA_MERCHANT_LOGIN;
  const password1 = process.env.ROBOKASSA_PASSWORD1;
  const testMode = process.env.ROBOKASSA_TEST_MODE !== "0";

  if (!merchantLogin || !password1) {
    return NextResponse.json(
      {
        error: "Платёжная система временно недоступна. Попробуйте позже.",
      },
      { status: 503 }
    );
  }

  const invId = randomUUID();
  const outSum = amount.toFixed(2);

  const signatureString = `${merchantLogin}:${outSum}:${invId}:${password1}`;
  const signatureValue = md5(signatureString);

  const dbAvailable = await isDatabaseAvailable();

  if (dbAvailable) {
    await createPayment({
      id: invId,
      userId: userId || undefined,
      advertiserId: advertiserId || undefined,
      amount,
      method: "robokassa",
      status: "pending",
      description: `Пополнение через Робокассу`,
    });
  }

  const robokassaUrl = new URL("https://auth.robokassa.ru/Merchant/Index.aspx");
  robokassaUrl.searchParams.set("MerchantLogin", merchantLogin);
  robokassaUrl.searchParams.set("OutSum", outSum);
  robokassaUrl.searchParams.set("InvId", invId);
  robokassaUrl.searchParams.set("SignatureValue", signatureValue);
  robokassaUrl.searchParams.set("IsTest", testMode ? "1" : "0");

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;
  robokassaUrl.searchParams.set(
    "SuccessUrl",
    `${baseUrl}/payment/success?userId=${userId || ""}&advertiserId=${advertiserId || ""}`
  );
  robokassaUrl.searchParams.set("FailUrl", `${baseUrl}/payment/fail`);

  return NextResponse.json({
    url: robokassaUrl.toString(),
    invId,
  });
}
