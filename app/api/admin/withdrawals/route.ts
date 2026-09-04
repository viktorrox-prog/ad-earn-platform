import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isDatabaseAvailable } from "@/lib/db";
import {
  getAllWithdrawalRequests,
  getUserById,
  getWithdrawalRequestById,
  refundWithdrawalFunds,
  updateWithdrawalRequestStatus,
  type WithdrawalRequest,
} from "@/lib/models";
import { mockUsers, mockWithdrawalRequests } from "@/lib/mock-data";
import { addWorkingDays } from "@/lib/utils";

const actionSchema = z.object({
  withdrawalId: z.string().min(1),
  action: z.enum(["approve", "reject"]),
});

const WITHDRAWAL_WORKING_DAYS = 3;

const SUPPORTED_METHODS = new Set(["azvox"]);

function isBrokenWithdrawalRequest(r: WithdrawalRequest): boolean {
  const amount = Number(r.amount);
  const recipient = (r.recipient ?? "").trim();
  const method = (r.method ?? "").trim();
  return (
    !Number.isFinite(amount) ||
    amount <= 0 ||
    recipient.length === 0 ||
    !SUPPORTED_METHODS.has(method) ||
    (r.status ?? "") === "rejected"
  );
}

export async function GET() {
  const dbAvailable = await isDatabaseAvailable();
  let requests = mockWithdrawalRequests;
  let lookupUser: (
    id: string
  ) => Promise<{ email: string; phone: string }> = async (id) => {
    const user = mockUsers.find((u) => u.id === id);
    return user
      ? { email: user.email, phone: user.phone }
      : { email: "", phone: "" };
  };
  if (dbAvailable) {
    try {
      const dbRequests = await getAllWithdrawalRequests();
      if (dbRequests.length > 0) {
        requests = dbRequests;
        lookupUser = async (id) => {
          try {
            const user = await getUserById(id);
            return user
              ? { email: user.email, phone: user.phone }
              : { email: "", phone: "" };
          } catch (err) {
            console.warn("Failed to load user for withdrawal", err);
            return { email: "", phone: "" };
          }
        };
      }
    } catch (err) {
      console.warn("Failed to load withdrawal requests from DB", err);
    }
  }

  requests = requests.filter((r) => !isBrokenWithdrawalRequest(r));

  const nowIso = new Date().toISOString().split("T")[0];
  const enriched = await Promise.all(
    requests.map(async (r) => {
      const createdAt = r.createdAt ?? new Date().toISOString();
      const payByDate =
        r.status === "pending"
          ? addWorkingDays(createdAt.split("T")[0], WITHDRAWAL_WORKING_DAYS)
          : null;
      const user = await lookupUser(r.userId ?? "");
      return {
        ...r,
        id: r.id ?? "",
        userId: r.userId ?? "",
        amount: Number(r.amount) || 0,
        method: r.method ?? "card",
        recipient: r.recipient ?? "",
        status: r.status ?? "pending",
        createdAt,
        userEmail: user.email,
        userPhone: user.phone,
        payByDate,
        processingDays: WITHDRAWAL_WORKING_DAYS,
        isOverdue: r.status === "pending" && !!payByDate && nowIso > payByDate,
      };
    })
  );

  return NextResponse.json({ withdrawalRequests: enriched });
}

export async function POST(request: NextRequest) {
  const parsed = actionSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Некорректные данные", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { withdrawalId, action } = parsed.data;
  const status = action === "approve" ? "approved" : "rejected";
  const dbAvailable = await isDatabaseAvailable();

  if (dbAvailable) {
    try {
      // Заявку можно обработать только из статуса pending. Если она уже
      // обработана (условное обновление вернуло null), повторная обработка
      // отклоняется — это исключает двойное списание или двойной возврат.
      const existing = await getWithdrawalRequestById(withdrawalId);
      const updated = await updateWithdrawalRequestStatus(withdrawalId, status);

      if (!updated) {
        return NextResponse.json(
          { error: "Заявка уже обработана" },
          { status: 400 }
        );
      }

      // Средства резервируются при создании заявки; при отклонении — возвращаем.
      if (action === "reject" && existing) {
        await refundWithdrawalFunds(existing.userId, Number(existing.amount));
      }
    } catch (err) {
      console.warn("Failed to update withdrawal status in DB", err);
    }
  }

  const req = mockWithdrawalRequests.find((r) => r.id === withdrawalId);
  if (req) {
    req.status = status;
  }

  return NextResponse.json({
    message:
      action === "approve" ? "Выплата подтверждена" : "Выплата отклонена",
  });
}
