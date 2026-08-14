import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { isDatabaseAvailable } from "@/lib/db";
import {
  getPaymentById,
  updatePaymentStatus,
  createTransaction,
  getAdvertiserById,
  updateAdvertiserBalance,
  creditReferralReward,
} from "@/lib/models";

function md5(data: string): string {
  return createHash("md5").update(data).digest("hex");
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const outSum = formData.get("OutSum") as string;
  const invId = formData.get("InvId") as string;
  const signatureValue = formData.get("SignatureValue") as string;

  if (!outSum || !invId || !signatureValue) {
    return new NextResponse("ERROR: missing params", { status: 400 });
  }

  const password2 = process.env.ROBOKASSA_PASSWORD2;
  if (!password2) {
    return new NextResponse("ERROR: payment not configured", {
      status: 503,
    });
  }

  const expectedSignature = md5(`${outSum}:${invId}:${password2}`);

  if (signatureValue.toLowerCase() !== expectedSignature.toLowerCase()) {
    return new NextResponse("ERROR: invalid signature", { status: 403 });
  }

  const dbAvailable = await isDatabaseAvailable();

  if (dbAvailable) {
    const payment = await getPaymentById(invId);
    if (!payment) {
      return new NextResponse("ERROR: payment not found", { status: 404 });
    }

    if (payment.status !== "pending") {
      return new NextResponse("OK");
    }

    await updatePaymentStatus(invId, "success");

    const amount = parseFloat(outSum);

    if (payment.userId) {
      await createTransaction({
        userId: payment.userId,
        type: "deposit",
        amount,
        description: `Пополнение через Робокассу`,
        status: "completed",
      });
    }

    if (payment.advertiserId) {
      const advertiser = await getAdvertiserById(payment.advertiserId);
      if (advertiser) {
        const newBalance = advertiser.balance + amount;
        await updateAdvertiserBalance(payment.advertiserId, newBalance);

        if (advertiser.referredBy) {
          await creditReferralReward(
            advertiser.referredBy,
            amount,
            advertiser.companyName
          );
        }
      }
    }
  }

  return new NextResponse("OK");
}
