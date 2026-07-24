import { NextRequest, NextResponse } from "next/server";
import {
  getAllHomepageBanners,
  updateHomepageBannerStatus,
} from "@/lib/models";
import { isDatabaseAvailable } from "@/lib/db";
import { moderateHomepageBannerSchema } from "@/lib/validation/homepage-banners";

export async function GET() {
  const dbAvailable = await isDatabaseAvailable();
  if (!dbAvailable) {
    return NextResponse.json({ banners: [] });
  }
  const banners = await getAllHomepageBanners();
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

  const parsed = moderateHomepageBannerSchema.safeParse({ status });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Некорректный статус", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const banner = await updateHomepageBannerStatus(bannerId, parsed.data.status);
  if (!banner) {
    return NextResponse.json({ error: "Баннер не найден" }, { status: 404 });
  }

  return NextResponse.json({
    message: `Баннер ${parsed.data.status === "active" ? "одобрен" : "отклонён"}`,
    banner,
  });
}
