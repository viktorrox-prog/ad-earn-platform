import { NextRequest, NextResponse } from "next/server";
import { isDatabaseAvailable } from "@/lib/db";
import {
  getAdvertisersByReferrer,
  getReferralClicksByReferrer,
  getReferralEarnings,
  getUserById,
} from "@/lib/models";
import { mockReferralClicks, mockTransactions } from "@/lib/mock-data";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "Не указан userId" }, { status: 400 });
  }

  const dbAvailable = await isDatabaseAvailable();
  let referredAdvertisersCount = 0;
  let earned = 0;
  let clicksCount = 0;
  let convertedClicksCount = 0;

  if (dbAvailable) {
    const user = await getUserById(userId);
    if (user) {
      const advertisers = await getAdvertisersByReferrer(userId);
      referredAdvertisersCount = advertisers.length;
      earned = await getReferralEarnings(userId);

      const clicks = await getReferralClicksByReferrer(userId);
      clicksCount = clicks.length;
      convertedClicksCount = clicks.filter(
        (c) => c.convertedAdvertiserId
      ).length;
    }
  } else {
    const mockReferralTx = mockTransactions.filter(
      (t) => t.userId === userId && t.type === "referral"
    );
    earned = mockReferralTx.reduce((sum, t) => sum + t.amount, 0);
    referredAdvertisersCount = 1;

    const clicks = mockReferralClicks.filter((c) => c.referrerId === userId);
    clicksCount = clicks.length;
    convertedClicksCount = clicks.filter((c) => c.convertedAdvertiserId).length;
  }

  const referralLink = `${request.nextUrl.origin}/advertiser?ref=${userId}`;

  return NextResponse.json({
    referralLink,
    referredAdvertisersCount,
    earned,
    clicksCount,
    convertedClicksCount,
  });
}
