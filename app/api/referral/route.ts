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
    try {
      const user = await getUserById(userId);
      if (user) {
        const advertisers = await getAdvertisersByReferrer(userId);
        referredAdvertisersCount = advertisers.length;
        earned = await getReferralEarnings(userId);

        try {
          const clicks = await getReferralClicksByReferrer(userId);
          clicksCount = clicks.length;
          convertedClicksCount = clicks.filter(
            (c) => c.convertedAdvertiserId
          ).length;
        } catch (clicksError) {
          console.error(
            "Failed to load referral clicks, showing zero clicks:",
            clicksError
          );
        }
      }
    } catch (error) {
      console.error(
        "Failed to load referral stats, falling back to mock data:",
        error
      );
      const mockReferralTx = mockTransactions.filter(
        (t) => t.userId === userId && t.type === "referral"
      );
      earned = mockReferralTx.reduce((sum, t) => sum + t.amount, 0);
      referredAdvertisersCount = 1;

      const clicks = mockReferralClicks.filter((c) => c.referrerId === userId);
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

  const publicOrigin = process.env.NEXT_PUBLIC_BASE_URL || "https://adearn.ru";
  const referralLink = `${publicOrigin}/advertiser?ref=${userId}`;

  return NextResponse.json({
    referralLink,
    referredAdvertisersCount,
    earned,
    clicksCount,
    convertedClicksCount,
  });
}
