import { NextRequest, NextResponse } from "next/server";
import {
  getAllActiveDashboardBanners,
  createDashboardBanner,
  createTransaction,
} from "@/lib/models";
import { isDatabaseAvailable } from "@/lib/db";
import { mockDashboardBanners } from "@/lib/mock-data";
import { purchaseDashboardBannerSchema } from "@/lib/validation/dashboard-banners";

const BANNER_PRICE = 300;

export async function GET() {
  const dbAvailable = await isDatabaseAvailable();
  if (dbAvailable) {
    const banners = await getAllActiveDashboardBanners();
    return NextResponse.json({ banners });
  }
  const now = new Date().toISOString();
  const valid = mockDashboardBanners.filter((b) => b.expiresAt > now);
  return NextResponse.json({ banners: valid });
}

export async function POST(request: NextRequest) {
  const dbAvailable = await isDatabaseAvailable();
  if (!dbAvailable) {
    return NextResponse.json(
      { error: "База данных недоступна" },
      { status: 503 }
    );
  }

  const parsed = purchaseDashboardBannerSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Некорректные данные", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { userId, imageUrl, targetUrl, days } = parsed.data;

  const totalPrice = BANNER_PRICE * days;

  const balanceRes = await fetch(
    `${request.nextUrl.origin}/api/balance?userId=${userId}`
  );
  const balanceData = await balanceRes.json();
  const balance = balanceData.balance ?? 0;

  if (balance < totalPrice) {
    return NextResponse.json(
      {
        error: `Недостаточно средств. Нужно ${totalPrice} ₽, на балансе ${balance} ₽`,
      },
      { status: 400 }
    );
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + days * 86400000).toISOString();

  const banner = await createDashboardBanner({
    userId,
    imageUrl,
    targetUrl,
    status: "pending",
    expiresAt,
  });

  await createTransaction({
    userId,
    type: "withdrawal",
    amount: -totalPrice,
    description: `Покупка размещения баннера на ${days} ${days === 1 ? "сут." : "сут."} — ${totalPrice} ₽`,
    status: "completed",
  });

  return NextResponse.json({ banner }, { status: 201 });
}
