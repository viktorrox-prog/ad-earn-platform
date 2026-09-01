import { NextRequest, NextResponse } from "next/server";
import { advertiserLoginSchema } from "@/lib/validation/advertiser";
import { isDatabaseAvailable } from "@/lib/db";
import { getAdvertiserByEmail } from "@/lib/models";
import { verifyPassword } from "@/lib/auth";
import { mockAdvertisers } from "@/lib/mock-data";

export async function POST(request: NextRequest) {
  const parsed = advertiserLoginSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Некорректные данные", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { email, password } = parsed.data;

  const dbAvailable = await isDatabaseAvailable();

  let advertiser = null;
  let isMock = false;

  if (dbAvailable) {
    advertiser = await getAdvertiserByEmail(email);
  } else {
    advertiser = mockAdvertisers.find((a) => a.email === email) ?? null;
    isMock = true;
  }

  if (!advertiser) {
    return NextResponse.json(
      { error: "Рекламодатель не найден" },
      { status: 404 }
    );
  }

  if (!isMock && !verifyPassword(password, advertiser.passwordHash)) {
    return NextResponse.json({ error: "Неверный пароль" }, { status: 401 });
  }

  return NextResponse.json({
    id: advertiser.id,
    companyName: advertiser.companyName,
    email: advertiser.email,
    phone: advertiser.phone,
    balance: advertiser.balance,
  });
}
