import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isDatabaseAvailable } from "@/lib/db";
import { getTaskReviewsByUserId } from "@/lib/models";
import { mockTaskReviews } from "@/lib/mock-data";

const querySchema = z.object({
  userId: z.string().min(1),
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    userId: searchParams.get("userId"),
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Не указан userId" }, { status: 400 });
  }

  const { userId } = parsed.data;
  const dbAvailable = await isDatabaseAvailable();

  let reviews = mockTaskReviews.filter((r) => r.userId === userId);

  if (dbAvailable) {
    const dbReviews = await getTaskReviewsByUserId(userId);
    if (dbReviews.length > 0) {
      reviews = dbReviews;
    }
  }

  return NextResponse.json({
    reviews: reviews.map((r) => ({
      taskId: r.taskId,
      status: r.status,
    })),
  });
}
