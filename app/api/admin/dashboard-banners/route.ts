import { NextRequest, NextResponse } from "next/server";
import {
  getAllDashboardBanners,
  updateDashboardBannerStatus,
} from "@/lib/models";
import { isDatabaseAvailable } from "@/lib/db";
import { moderateDashboardBannerSchema } from "@/lib/validation/dashboard-banners";

export async function GET() {
  const dbAvailable = await isDatabaseAvailable();
  if (!dbAvailable) {
    return NextResponse.json({ banners: [] });
  }
  const banners = await getAllDashboardBanners();
  const sorted = banners.sort(
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

  const banner = await updateDashboardBannerStatus(
    bannerId,
    parsed.data.status
  );
  if (!banner) {
    return NextResponse.json({ error: "Баннер не найден" }, { status: 404 });
  }

  return NextResponse.json({
    message: `Баннер ${parsed.data.status === "active" ? "одобрен" : "отклонён"}`,
    banner,
  });
}
