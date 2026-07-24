import { NextRequest, NextResponse } from "next/server";
import { depositSchema } from "@/lib/validation/finance";

export async function POST(request: NextRequest) {
  const parsed = depositSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Некорректные данные", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  return NextResponse.json(
    {
      error: "Платёжные системы будут доступны после запуска платформы",
    },
    { status: 503 }
  );
}
