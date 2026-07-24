import { NextRequest, NextResponse } from "next/server";
import { getAllBroadcasts, createBroadcast } from "@/lib/models";
import { isDatabaseAvailable } from "@/lib/db";
import { mockBroadcasts } from "@/lib/mock-data";
import { createBroadcastSchema } from "@/lib/validation/admin";

export async function GET() {
  const dbAvailable = await isDatabaseAvailable();
  if (!dbAvailable) {
    return NextResponse.json({ broadcasts: mockBroadcasts });
  }
  const broadcasts = await getAllBroadcasts();
  return NextResponse.json({ broadcasts });
}

export async function POST(request: NextRequest) {
  const dbAvailable = await isDatabaseAvailable();
  if (!dbAvailable) {
    return NextResponse.json(
      { error: "База данных недоступна" },
      { status: 503 }
    );
  }

  const parsed = createBroadcastSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Некорректные данные", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const broadcast = await createBroadcast(parsed.data);

  return NextResponse.json({ broadcast }, { status: 201 });
}
