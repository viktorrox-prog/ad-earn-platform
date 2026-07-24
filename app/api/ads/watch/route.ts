import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isDatabaseAvailable } from "@/lib/db";
import {
  getAdById,
  getTodayAdViewsCount,
  createAdView,
  createTransaction,
} from "@/lib/models";
import { mockAds } from "@/lib/mock-data";

const watchSchema = z.object({
  userId: z.string().min(1),
  adId: z.string().min(1),
});

const DAILY_LIMIT = 20;

export async function POST(request: NextRequest) {
  const parsed = watchSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Некорректные данные", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { userId, adId } = parsed.data;
  const dbAvailable = await isDatabaseAvailable();

  const ad =
    (dbAvailable ? await getAdById(adId) : null) ??
    mockAds.find((a) => a.id === adId) ??
    null;

  if (!ad) {
    return NextResponse.json(
      { error: "Объявление не найдено" },
      { status: 404 }
    );
  }

  if (ad.status !== "active") {
    return NextResponse.json(
      { error: "Объявление не активно" },
      { status: 400 }
    );
  }

  const todayViews = await getTodayAdViewsCount(userId);

  if (todayViews >= DAILY_LIMIT) {
    return NextResponse.json(
      {
        error: "Достигнут дневной лимит просмотров",
        todayViews,
        dailyLimit: DAILY_LIMIT,
      },
      { status: 429 }
    );
  }

  if (dbAvailable) {
    const reward = Math.round(ad.duration * 0.0035 * 100) / 100;

    await createAdView({
      userId,
      adId,
      reward,
      watchedAt: new Date().toISOString(),
    });

    await createTransaction({
      userId,
      type: "earnings",
      amount: reward,
      description: `Просмотр рекламы — «${ad.title}»`,
      status: "completed",
    });
  }

  const reward = Math.round(ad.duration * 0.0035 * 100) / 100;

  return NextResponse.json({
    success: true,
    reward,
    message: `Начислено ${reward.toFixed(2)} ₽ за просмотр`,
  });
}
