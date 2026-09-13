import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isDatabaseAvailable } from "@/lib/db";
import { getAdById, recordCampaignClick } from "@/lib/models";
import { mockAds } from "@/lib/mock-data";

const clickSchema = z.object({
  userId: z.string().min(1),
  adId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const parsed = clickSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Некорректные данные", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { adId } = parsed.data;
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

  // Фиксируем клик по ссылке объявления — увеличиваем clicks кампании,
  // чтобы рекламодатель видел число переходов по своим ссылкам.
  if (dbAvailable && ad.campaignId) {
    try {
      await recordCampaignClick(ad.campaignId);
    } catch (err) {
      console.error("[ads/click] Не удалось зафиксировать клик:", err);
    }
  }

  return NextResponse.json({ success: true });
}
