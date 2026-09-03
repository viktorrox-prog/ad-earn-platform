import { NextRequest, NextResponse } from "next/server";
import { getAllBroadcasts, createBroadcast } from "@/lib/models";
import { isDatabaseAvailable } from "@/lib/db";
import { mockBroadcasts } from "@/lib/mock-data";
import { createBroadcastSchema } from "@/lib/validation/admin";

export async function GET() {
  const dbAvailable = await isDatabaseAvailable();
  let broadcasts = mockBroadcasts;
  if (dbAvailable) {
    try {
      const dbBroadcasts = await getAllBroadcasts();
      if (dbBroadcasts.length > 0) {
        broadcasts = dbBroadcasts;
      }
    } catch (err) {
      console.warn("Failed to load broadcasts from DB", err);
    }
  }
  const normalized = broadcasts.map((b) => ({
    ...b,
    id: b.id ?? "",
    title: b.title ?? "Рассылка",
    message: b.message ?? "",
    createdAt: b.createdAt ?? new Date().toISOString(),
  }));
  return NextResponse.json({ broadcasts: normalized });
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

  let broadcast;
  try {
    broadcast = await createBroadcast(parsed.data);
  } catch (err) {
    console.warn("Failed to create broadcast", err);
    return NextResponse.json(
      { error: "Ошибка создания рассылки" },
      { status: 500 }
    );
  }

  return NextResponse.json({ broadcast }, { status: 201 });
}
