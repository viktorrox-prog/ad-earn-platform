import { NextRequest, NextResponse } from "next/server";
import { isDatabaseAvailable } from "@/lib/db";
import { getTransactionsByUserId } from "@/lib/models";
import { mockTransactions } from "@/lib/mock-data";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "Не указан userId" }, { status: 400 });
  }

  const dbAvailable = await isDatabaseAvailable();

  let transactions = mockTransactions.filter((t) => t.userId === userId);

  if (dbAvailable) {
    const dbTransactions = await getTransactionsByUserId(userId);
    if (dbTransactions.length > 0) {
      transactions = dbTransactions;
    }
  }

  transactions.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const balance = transactions.reduce(
    (acc, t) => (t.status === "completed" ? acc + t.amount : acc),
    0
  );

  return NextResponse.json({
    balance: Math.max(0, balance),
    transactions,
  });
}
