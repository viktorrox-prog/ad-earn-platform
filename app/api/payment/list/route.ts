import { NextRequest, NextResponse } from "next/server";
import { isDatabaseAvailable } from "@/lib/db";
import { getPaymentsByUserId, getPaymentsByAdvertiserId } from "@/lib/models";
import { mockPayments } from "@/lib/mock-data";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const advertiserId = searchParams.get("advertiserId");

  const dbAvailable = await isDatabaseAvailable();

  let payments = mockPayments;

  if (dbAvailable) {
    if (userId) {
      const dbPayments = await getPaymentsByUserId(userId);
      if (dbPayments.length > 0) {
        payments = dbPayments;
      }
    } else if (advertiserId) {
      const dbPayments = await getPaymentsByAdvertiserId(advertiserId);
      if (dbPayments.length > 0) {
        payments = dbPayments;
      }
    }
  }

  if (userId) {
    payments = payments.filter((p) => p.userId === userId);
  } else if (advertiserId) {
    payments = payments.filter((p) => p.advertiserId === advertiserId);
  }

  payments.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return NextResponse.json({ payments });
}
