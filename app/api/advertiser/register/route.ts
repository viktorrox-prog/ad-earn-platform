import { NextRequest, NextResponse } from "next/server";
import { advertiserRegisterSchema } from "@/lib/validation/advertiser";
import { isDatabaseAvailable } from "@/lib/db";
import {
  createAdvertiser,
  getAdvertiserByEmail,
  getUserById,
} from "@/lib/models";
import { hashPassword } from "@/lib/auth";
import { mockAdvertisers } from "@/lib/mock-data";

export async function POST(request: NextRequest) {
  const parsed = advertiserRegisterSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Некорректные данные", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { companyName, email, phone, password, refCode } = parsed.data;

  let referredBy: string | undefined;

  if (refCode) {
    const dbAvailable = await isDatabaseAvailable();
    if (dbAvailable) {
      const referringUser = await getUserById(refCode);
      if (referringUser) {
        referredBy = referringUser.id;
      }
    }
  }

  const dbAvailable = await isDatabaseAvailable();

  if (dbAvailable) {
    const existing = await getAdvertiserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: "Рекламодатель с таким email уже зарегистрирован" },
        { status: 409 }
      );
    }
  } else {
    const existing = mockAdvertisers.find((a) => a.email === email);
    if (existing) {
      return NextResponse.json(
        { error: "Рекламодатель с таким email уже зарегистрирован" },
        { status: 409 }
      );
    }
  }

  const passwordHash = hashPassword(password);

  if (dbAvailable) {
    const { randomUUID } = await import("crypto");
    const advertiser = await createAdvertiser({
      id: randomUUID(),
      companyName,
      email,
      phone,
      passwordHash,
      balance: 0,
      referredBy,
    });

    return NextResponse.json({
      id: advertiser.id,
      companyName: advertiser.companyName,
      email: advertiser.email,
      phone: advertiser.phone,
      balance: advertiser.balance,
    });
  }

  return NextResponse.json({
    id: "mock-advertiser-registered",
    companyName,
    email,
    phone,
    balance: 0,
  });
}
