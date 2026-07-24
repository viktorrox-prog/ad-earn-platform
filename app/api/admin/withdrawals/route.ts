import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isDatabaseAvailable } from "@/lib/db";
import {
  getAllWithdrawalRequests,
  updateWithdrawalRequestStatus,
} from "@/lib/models";
import { mockWithdrawalRequests } from "@/lib/mock-data";

const actionSchema = z.object({
  withdrawalId: z.string().min(1),
  action: z.enum(["approve", "reject"]),
});

export async function GET() {
  const dbAvailable = await isDatabaseAvailable();
  let requests = mockWithdrawalRequests;
  if (dbAvailable) {
    const dbRequests = await getAllWithdrawalRequests();
    if (dbRequests.length > 0) {
      requests = dbRequests;
    }
  }
  return NextResponse.json({ withdrawalRequests: requests });
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
    await updateWithdrawalRequestStatus(withdrawalId, status);
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
