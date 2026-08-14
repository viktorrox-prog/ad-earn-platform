import { NextRequest, NextResponse } from "next/server";
import { topUpSchema } from "@/lib/validation/advertiser";
import { isDatabaseAvailable } from "@/lib/db";
import { getAdvertiserById } from "@/lib/models";
import { mockAdvertisers } from "@/lib/mock-data";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const advertiserId = searchParams.get("advertiserId");

  if (!advertiserId) {
    return NextResponse.json(
      { error: "Не указан advertiserId" },
      { status: 400 }
    );
  }

  const dbAvailable = await isDatabaseAvailable();
  let advertiser = null;

  if (dbAvailable) {
    advertiser = await getAdvertiserById(advertiserId);
  } else {
    advertiser = mockAdvertisers.find((a) => a.id === advertiserId) ?? null;
  }

  if (!advertiser) {
    return NextResponse.json(
      { error: "Рекламодатель не найден" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    id: advertiser.id,
    companyName: advertiser.companyName,
    email: advertiser.email,
    phone: advertiser.phone,
    balance: advertiser.balance,
  });
}

export async function POST(request: NextRequest) {
  const parsed = topUpSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Некорректные данные", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Платёжные системы (Робокасса, ЮMoney) ещё не подключены.
  // Запрещаем холостое начисление баланса без реальной оплаты.
  return NextResponse.json(
    {
      error: "Платёжные системы будут доступны после запуска платформы",
    },
    { status: 503 }
  );
}
