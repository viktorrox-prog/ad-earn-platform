import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isDatabaseAvailable } from "@/lib/db";
import { createReferralClick } from "@/lib/models";

const trackClickSchema = z.object({
  referrerId: z.string().min(1).max(100),
});

export async function POST(request: NextRequest) {
  const parsed = trackClickSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Некорректные данные", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  if (!(await isDatabaseAvailable())) {
    return NextResponse.json(
      { error: "База данных недоступна" },
      { status: 503 }
    );
  }

  const { referrerId } = parsed.data;

  try {
    const click = await createReferralClick(referrerId);
    return NextResponse.json({ clickId: click.id }, { status: 201 });
  } catch (error) {
    console.error("Failed to track referral click:", error);
    return NextResponse.json(
      { error: "Не удалось зафиксировать переход" },
      { status: 500 }
    );
  }
}
