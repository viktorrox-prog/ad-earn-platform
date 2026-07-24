import { NextRequest, NextResponse } from "next/server";
import {
  getActiveHomepageBanners,
  createHomepageBanner,
  createTransaction,
} from "@/lib/models";
import { isDatabaseAvailable } from "@/lib/db";
import { purchaseHomepageBannerSchema } from "@/lib/validation/homepage-banners";

const BANNER_PRICE = 300;

export async function GET() {
  const dbAvailable = await isDatabaseAvailable();
  if (dbAvailable) {
    const banners = await getActiveHomepageBanners();
    return NextResponse.json({ banners });
  }
  return NextResponse.json({ banners: [] });
}

export async function POST(request: NextRequest) {
  const dbAvailable = await isDatabaseAvailable();
  if (!dbAvailable) {
    return NextResponse.json(
      { error: "База данных недоступна" },
      { status: 503 }
    );
  }

  const parsed = purchaseHomepageBannerSchema.safeParse(await request.json());
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

  const banner = await createHomepageBanner({
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
    description: `Покупка размещения баннера на главной на ${days} сут. — ${totalPrice} ₽`,
    status: "completed",
  });

  return NextResponse.json({ banner }, { status: 201 });
}
