import { NextRequest, NextResponse } from "next/server";
import {
  getAllHomepageBanners,
  updateHomepageBannerStatus,
} from "@/lib/models";
import { isDatabaseAvailable } from "@/lib/db";
import { moderateHomepageBannerSchema } from "@/lib/validation/homepage-banners";
import { mockHomepageBanners } from "@/lib/mock-data";

export async function GET() {
  const dbAvailable = await isDatabaseAvailable();
  let banners = mockHomepageBanners;
  if (dbAvailable) {
    try {
      const dbBanners = await getAllHomepageBanners();
      if (dbBanners.length > 0) {
        banners = dbBanners;
      }
    } catch (err) {
      console.warn("Failed to load homepage banners from DB", err);
    }
  }
  const normalized = banners.map((b) => ({
    ...b,
    id: b.id ?? "",
    userId: b.userId ?? "",
    imageUrl: b.imageUrl ?? "",
    targetUrl: b.targetUrl ?? "",
    status: b.status ?? "pending",
    createdAt: b.createdAt ?? new Date().toISOString(),
    expiresAt: b.expiresAt ?? null,
  }));
  const sorted = normalized.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return NextResponse.json({ banners: sorted });
}

export async function POST(request: NextRequest) {
  const dbAvailable = await isDatabaseAvailable();
  if (!dbAvailable) {
    return NextResponse.json(
      { error: "База данных недоступна" },
      { status: 503 }
    );
  }

  const body = await request.json();
  const { bannerId, status } = body;

  if (!bannerId || typeof bannerId !== "string") {
    return NextResponse.json(
      { error: "Не указан ID баннера" },
      { status: 400 }
    );
  }

  const parsed = moderateHomepageBannerSchema.safeParse({ status });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Некорректный статус", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  let banner;
  try {
    banner = await updateHomepageBannerStatus(bannerId, parsed.data.status);
  } catch (err) {
    console.warn("Failed to update homepage banner status", err);
    return NextResponse.json(
      { error: "Ошибка обновления статуса баннера" },
      { status: 500 }
    );
  }
  if (!banner) {
    return NextResponse.json({ error: "Баннер не найден" }, { status: 404 });
  }

  return NextResponse.json({
    message: `Баннер ${parsed.data.status === "active" ? "одобрен" : "отклонён"}`,
    banner,
  });
}
