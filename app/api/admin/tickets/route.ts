import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isDatabaseAvailable } from "@/lib/db";
import { getAllTickets, respondToTicket } from "@/lib/models";
import { mockTickets } from "@/lib/mock-data";

const respondSchema = z.object({
  ticketId: z.string().min(1),
  adminResponse: z.string().min(1).max(5000),
});

export async function GET() {
  const dbAvailable = await isDatabaseAvailable();
  let tickets = mockTickets;
  if (dbAvailable) {
    const dbTickets = await getAllTickets();
    if (dbTickets.length > 0) {
      tickets = dbTickets;
    }
  }
  return NextResponse.json({ tickets });
}

export async function POST(request: NextRequest) {
  const parsed = respondSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Некорректные данные", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { ticketId, adminResponse } = parsed.data;
  const dbAvailable = await isDatabaseAvailable();

  if (dbAvailable) {
    await respondToTicket(ticketId, adminResponse);
  }

  const ticket = mockTickets.find((t) => t.id === ticketId);
  if (ticket) {
    ticket.adminResponse = adminResponse;
    ticket.status = "closed";
    ticket.updatedAt = new Date().toISOString();
  }

  return NextResponse.json({ message: "Ответ отправлен" });
}
