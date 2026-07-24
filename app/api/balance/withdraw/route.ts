import { NextRequest, NextResponse } from "next/server";
import { withdrawSchema } from "@/lib/validation/finance";
import { isDatabaseAvailable } from "@/lib/db";
import {
  createWithdrawalRequest,
  getWithdrawalRequestsByUserId,
  getTransactionsByUserId,
} from "@/lib/models";
import { mockTransactions, mockWithdrawalRequests } from "@/lib/mock-data";

export async function POST(request: NextRequest) {
  const parsed = withdrawSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Некорректные данные", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { userId, amount, method, recipient } = parsed.data;

  const dbAvailable = await isDatabaseAvailable();

  let transactions = mockTransactions.filter((t) => t.userId === userId);

  if (dbAvailable) {
    const dbTransactions = await getTransactionsByUserId(userId);
    if (dbTransactions.length > 0) {
      transactions = dbTransactions;
    }
  }

  const balance = transactions.reduce(
    (acc, t) => (t.status === "completed" ? acc + t.amount : acc),
    0
  );

  if (balance < amount) {
    return NextResponse.json(
      { error: "Недостаточно средств на балансе" },
      { status: 400 }
    );
  }

  if (dbAvailable) {
    await createWithdrawalRequest({
      userId,
      amount,
      method,
      recipient,
    });
  }

  return NextResponse.json({
    success: true,
    amount,
    method,
    recipient,
    message: "Заявка на вывод создана. Ожидает подтверждения.",
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "Не указан userId" }, { status: 400 });
  }

  const dbAvailable = await isDatabaseAvailable();
  let requests = mockWithdrawalRequests.filter((r) => r.userId === userId);

  if (dbAvailable) {
    const dbRequests = await getWithdrawalRequestsByUserId(userId);
    if (dbRequests.length > 0) {
      requests = dbRequests;
    }
  }

  return NextResponse.json({ requests });
}
