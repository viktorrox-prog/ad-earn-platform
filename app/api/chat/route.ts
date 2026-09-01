import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isDatabaseAvailable } from "@/lib/db";
import { createChatMessage, getChatMessagesByUserId } from "@/lib/models";

const sendSchema = z.object({
  userId: z.string().min(1),
  text: z.string().min(1).max(2000),
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "Не указан userId" }, { status: 400 });
  }

  const dbAvailable = await isDatabaseAvailable();
  if (!dbAvailable) {
    return NextResponse.json({ messages: [] });
  }

  const messages = await getChatMessagesByUserId(userId);
  messages.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  return NextResponse.json({ messages });
}

export async function POST(request: NextRequest) {
  const parsed = sendSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Некорректные данные", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const dbAvailable = await isDatabaseAvailable();
  if (!dbAvailable) {
    return NextResponse.json(
      { error: "База данных недоступна" },
      { status: 503 }
    );
  }

  const message = await createChatMessage({
    userId: parsed.data.userId,
    sender: "user",
    text: parsed.data.text.trim(),
  });
  return NextResponse.json({
    message: "Сообщение отправлено",
    chatMessage: message,
  });
}
