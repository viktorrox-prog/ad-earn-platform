import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isDatabaseAvailable } from "@/lib/db";
import { createTicket } from "@/lib/models";

const createTicketSchema = z.object({
  userId: z.string().min(1),
  subject: z.string().min(1).max(200),
  message: z.string().min(1).max(5000),
});

export async function POST(request: NextRequest) {
  const parsed = createTicketSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Некорректные данные", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { userId, subject, message } = parsed.data;
  const dbAvailable = await isDatabaseAvailable();

  if (dbAvailable) {
    const ticket = await createTicket({ userId, subject, message });
    return NextResponse.json({ message: "Тикет создан", ticket });
  }

  return NextResponse.json(
    { error: "База данных недоступна" },
    { status: 503 }
  );
}
