import { NextRequest, NextResponse } from "next/server";
import { withdrawSchema } from "@/lib/validation/finance";
import { isDatabaseAvailable } from "@/lib/db";
import {
  createWithdrawalRequestWithReservation,
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
    try {
      const dbTransactions = await getTransactionsByUserId(userId);
      if (dbTransactions.length > 0) {
        transactions = dbTransactions;
      }
    } catch (err) {
      console.warn("Failed to load transactions for withdrawal balance", err);
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
    // Создаём заявку и сразу резервируем сумму одной транзакцией DynamoDB.
    try {
      await createWithdrawalRequestWithReservation({
        userId,
        amount,
        method,
        recipient,
      });
    } catch (err) {
      console.error(
        "[withdraw] Не удалось создать заявку с резервированием:",
        err
      );

      // Fallback: если транзакционное создание недоступно (например, таблица
      // withdrawal_requests ещё не создана миграцией), пробуем простую запись.
      try {
        await createWithdrawalRequest({
          userId,
          amount,
          method,
          recipient,
        });
        console.warn(
          "[withdraw] Заявка создана без резервирования (fallback)"
        );
      } catch (fallbackErr) {
        console.error(
          "[withdraw] Fallback создания заявки тоже не сработал:",
          fallbackErr
        );
        return NextResponse.json(
          {
            error:
              "Не удалось создать заявку на вывод. Проверьте, что миграция базы выполнена.",
          },
          { status: 500 }
        );
      }
    }
  } else {
    // Режим без БД: записываем в mock, чтобы заявка была видна в текущей сессии.
    const { randomUUID } = await import("crypto");
    mockWithdrawalRequests.push({
      id: randomUUID(),
      userId,
      amount,
      method,
      recipient,
      status: "pending",
      createdAt: new Date().toISOString(),
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
    try {
      const dbRequests = await getWithdrawalRequestsByUserId(userId);
      if (dbRequests.length > 0) {
        requests = dbRequests;
      }
    } catch (err) {
      console.warn("Failed to load withdrawal requests", err);
    }
  }

  return NextResponse.json({ requests });
}
