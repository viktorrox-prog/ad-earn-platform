import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isDatabaseAvailable } from "@/lib/db";
import {
  getPendingTaskReviewsByAdvertiser,
  updateTaskReviewStatus,
  getReviewById,
  createTransaction,
  incrementCampaignCompletions,
  getExpiredPendingReviews,
} from "@/lib/models";
import { mockTaskReviews } from "@/lib/mock-data";

const reviewActionSchema = z.object({
  reviewId: z.string().min(1),
  action: z.enum(["approve", "reject"]),
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const advertiserId = searchParams.get("advertiserId");

  if (!advertiserId) {
    return NextResponse.json(
      { error: "Не указан advertiserId" },
      { status: 400 }
    );
  }

  const dbAvailable = await isDatabaseAvailable();

  let reviews = mockTaskReviews.filter((r) => r.advertiserId === advertiserId);

  if (dbAvailable) {
    const dbReviews = await getPendingTaskReviewsByAdvertiser(advertiserId);
    if (dbReviews.length > 0) {
      reviews = dbReviews;
    }

    const expired = await getExpiredPendingReviews();
    const expiredForAdvertiser = expired.filter(
      (r) => r.advertiserId === advertiserId
    );
    for (const review of expiredForAdvertiser) {
      await updateTaskReviewStatus(review.id, "approved");
      await createTransaction({
        userId: review.userId,
        type: "earnings",
        amount: review.reward,
        description: `Выполнение задания — ${review.taskTitle ?? "Задание"} (авто-подтверждение)`,
        status: "completed",
      });
      if (review.campaignId) {
        await incrementCampaignCompletions(review.campaignId);
      }
    }

    const updatedReviews =
      await getPendingTaskReviewsByAdvertiser(advertiserId);
    if (updatedReviews.length > 0) {
      reviews = updatedReviews;
    }
  }

  const now = new Date().toISOString();
  const enriched = reviews.map((r) => ({
    ...r,
    timeRemaining:
      r.expiresAt > now
        ? Math.ceil(
            (new Date(r.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60)
          )
        : 0,
    expired: r.expiresAt < now,
  }));

  return NextResponse.json({ reviews: enriched });
}

export async function POST(request: NextRequest) {
  if (!(await isDatabaseAvailable())) {
    return NextResponse.json(
      { error: "База данных недоступна" },
      { status: 503 }
    );
  }

  const parsed = reviewActionSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Некорректные данные", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { reviewId, action } = parsed.data;

  const review = await getReviewById(reviewId);
  if (!review) {
    return NextResponse.json({ error: "Запись не найдена" }, { status: 404 });
  }

  if (review.status !== "pending") {
    return NextResponse.json(
      { error: "Задание уже проверено" },
      { status: 409 }
    );
  }

  if (review.expiresAt < new Date().toISOString()) {
    return NextResponse.json({ error: "Срок проверки истёк" }, { status: 410 });
  }

  const newStatus = action === "approve" ? "approved" : "rejected";
  await updateTaskReviewStatus(reviewId, newStatus);

  if (action === "approve") {
    await createTransaction({
      userId: review.userId,
      type: "earnings",
      amount: review.reward,
      description: `Выполнение задания — ${review.taskTitle ?? "Задание"} (подтверждено рекламодателем)`,
      status: "completed",
    });

    if (review.campaignId) {
      await incrementCampaignCompletions(review.campaignId);
    }
  }

  return NextResponse.json({
    success: true,
    status: newStatus,
    message:
      action === "approve"
        ? "Задание подтверждено, вознаграждение начислено"
        : "Задание отклонено",
  });
}
