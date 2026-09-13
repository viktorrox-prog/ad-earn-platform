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

export async function GET() {
  try {
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

    const nowIso = new Date().toISOString().split("T")[0];
    const enriched = await Promise.all(
      requests.map(async (r) => {
        const createdAt = r.createdAt ?? new Date().toISOString();
        let payByDate: string | null = null;
        if (r.status === "pending") {
          try {
            payByDate = addWorkingDays(
              createdAt.split("T")[0],
              WITHDRAWAL_WORKING_DAYS
            );
          } catch {
            payByDate = null;
          }
        }
        const user = await lookupUser(r.userId ?? "");
        return {
          id: r.id ?? "",
          userId: r.userId ?? "",
          amount: Number(r.amount) || 0,
          method: r.method ?? "azvox",
          recipient: r.recipient ?? "",
          status: r.status ?? "pending",
          createdAt,
          userEmail: user.email,
          userPhone: user.phone,
          payByDate,
          processingDays: WITHDRAWAL_WORKING_DAYS,
          isOverdue:
            r.status === "pending" && !!payByDate && nowIso > payByDate,
        };
      })
    );

    return NextResponse.json({ withdrawalRequests: enriched });
  } catch (err) {
    console.error("[admin/withdrawals] GET error:", err);
    // Никогда не роняем админку из-за кривых данных — возвращаем пустой список.
    return NextResponse.json({ withdrawalRequests: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
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
        const existing = await getWithdrawalRequestById(withdrawalId);
        const updated = await updateWithdrawalRequestStatus(
          withdrawalId,
          status
        );

        if (!updated) {
          return NextResponse.json(
            { error: "Заявка уже обработана" },
            { status: 400 }
          );
        }

        if (action === "reject" && existing) {
          await refundWithdrawalFunds(existing.userId, Number(existing.amount));
        }
      } catch (err) {
        console.warn("Failed to update withdrawal status in DB", err);
        return NextResponse.json(
          { error: "Не удалось обновить статус заявки" },
          { status: 500 }
        );
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
  } catch (err) {
    console.error("[admin/withdrawals] POST error:", err);
    return NextResponse.json(
      { error: "Ошибка обработки заявки" },
      { status: 500 }
    );
  }
}
