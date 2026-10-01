import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isDatabaseAvailable } from "@/lib/db";
import {
  getActiveAds,
  getTodayAdViewsCount,
  computeAdUserReward,
} from "@/lib/models";
import { mockAds } from "@/lib/mock-data";

const querySchema = z.object({
  userId: z.string().min(1),
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    userId: searchParams.get("userId"),
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Не указан userId" }, { status: 400 });
  }

  const { userId } = parsed.data;
  const dbAvailable = await isDatabaseAvailable();

  let ads = mockAds.filter((a) => a.status === "active");

  if (dbAvailable) {
    const dbAds = await getActiveAds();
    if (dbAds.length > 0) {
      ads = dbAds;
    }
  }

  const todayViews = await getTodayAdViewsCount(userId);
  const DAILY_LIMIT = 50;
  const viewsRemaining = Math.max(0, DAILY_LIMIT - todayViews);

  // В reward всегда отдаём фактически начисляемую пользователю сумму
  // (7% от цены рекламодателя), а не цену, которую платит рекламодатель.
  const normalizedAds = ads.map((ad) => ({
    ...ad,
    reward: computeAdUserReward(ad),
  }));

  return NextResponse.json({
    ads: normalizedAds,
    todayViews,
    viewsRemaining,
    dailyLimit: DAILY_LIMIT,
  });
}
