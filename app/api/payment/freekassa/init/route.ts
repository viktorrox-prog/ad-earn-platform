import { NextRequest, NextResponse } from "next/server";
import { paymentInitSchema } from "@/lib/validation/payment";
import {
  createFreekassaPayment,
  PaymentNotConfiguredError,
} from "@/lib/payments";

export async function POST(request: NextRequest) {
  const parsed = paymentInitSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Некорректные данные", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { userId, advertiserId } = parsed.data;
  if (!userId && !advertiserId) {
    return NextResponse.json(
      { error: "Укажите userId или advertiserId" },
      { status: 400 }
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;

  try {
    const result = await createFreekassaPayment(parsed.data, baseUrl);
    return NextResponse.json({ url: result.url, invId: result.invId });
  } catch (err) {
    if (err instanceof PaymentNotConfiguredError) {
      return NextResponse.json(
        { error: "Платёжная система временно недоступна. Попробуйте позже." },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: "Не удалось создать платёж. Попробуйте позже." },
      { status: 502 }
    );
  }
}
