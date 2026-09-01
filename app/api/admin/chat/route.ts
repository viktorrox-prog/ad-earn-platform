import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isDatabaseAvailable } from "@/lib/db";
import { createChatMessage, getAllChatMessages } from "@/lib/models";

const replySchema = z.object({
  userId: z.string().min(1),
  text: z.string().min(1).max(2000),
});

export async function GET() {
  const dbAvailable = await isDatabaseAvailable();
  if (!dbAvailable) {
    return NextResponse.json({ conversations: [] });
  }

  const messages = await getAllChatMessages();
  const grouped: Record<
    string,
    {
      userId: string;
      messages: typeof messages;
      lastActivity: string;
      unreadUserMessages: number;
    }
  > = {};

  for (const m of messages) {
    if (!grouped[m.userId]) {
      grouped[m.userId] = {
        userId: m.userId,
        messages: [],
        lastActivity: m.createdAt,
        unreadUserMessages: 0,
      };
    }
    grouped[m.userId].messages.push(m);
    if (
      new Date(m.createdAt).getTime() >
      new Date(grouped[m.userId].lastActivity).getTime()
    ) {
      grouped[m.userId].lastActivity = m.createdAt;
    }
    if (m.sender === "user") {
      grouped[m.userId].unreadUserMessages += 1;
    }
  }

  const conversations = Object.values(grouped)
    .map((c) => ({
      ...c,
      messages: c.messages.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      ),
    }))
    .sort(
      (a, b) =>
        new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
    );

  return NextResponse.json({ conversations });
}

export async function POST(request: NextRequest) {
  const parsed = replySchema.safeParse(await request.json());
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

  const chatMessage = await createChatMessage({
    userId: parsed.data.userId,
    sender: "admin",
    text: parsed.data.text.trim(),
  });
  return NextResponse.json({ message: "Ответ отправлен", chatMessage });
}
