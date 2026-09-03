import { NextRequest, NextResponse } from "next/server";
import {
  getAllDashboardBanners,
  updateDashboardBannerStatus,
} from "@/lib/models";
import { isDatabaseAvailable } from "@/lib/db";
import { moderateDashboardBannerSchema } from "@/lib/validation/dashboard-banners";
import { mockDashboardBanners } from "@/lib/mock-data";

export async function GET() {
  const dbAvailable = await isDatabaseAvailable();
  let banners = mockDashboardBanners;
  if (dbAvailable) {
    try {
      const dbBanners = await getAllDashboardBanners();
      if (dbBanners.length > 0) {
        banners = dbBanners;
      }
    } catch (err) {
      console.warn("Failed to load dashboard banners from DB", err);
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

  const parsed = moderateDashboardBannerSchema.safeParse({ status });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Некорректный статус", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  let banner;
  try {
    banner = await updateDashboardBannerStatus(bannerId, parsed.data.status);
  } catch (err) {
    console.warn("Failed to update dashboard banner status", err);
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
