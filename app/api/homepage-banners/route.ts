import { NextRequest, NextResponse } from "next/server";
import {
  getActiveHomepageBanners,
  createHomepageBannerWithPayment,
  getUserBalance,
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
  try {
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

    // Баланс читаем напрямую из БД, а не через внутренний fetch: на проде
    // request.nextUrl.origin равен внутреннему адресу (0.0.0.0:3000), и запрос
    // сам к себе падал с ошибкой соединения.
    const balance = await getUserBalance(userId);

    if (balance < totalPrice) {
      return NextResponse.json(
        {
          error: `Недостаточно средств. Нужно ${totalPrice} ₽, на балансе ${balance.toFixed(2)} ₽`,
        },
        { status: 400 }
      );
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + days * 86400000).toISOString();

    // Баннер и списание создаются атомарно одной транзакцией.
    const banner = await createHomepageBannerWithPayment({
      userId,
      imageUrl,
      targetUrl,
      days,
      expiresAt,
    });

    return NextResponse.json({ banner }, { status: 201 });
  } catch (err) {
    console.error("[homepage-banners] Ошибка покупки баннера:", err);
    return NextResponse.json(
      { error: "Не удалось создать баннер. Попробуйте ещё раз." },
      { status: 500 }
    );
  }
}
