import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isDatabaseAvailable } from "@/lib/db";
import {
  getActiveTasks,
  getTaskById,
  getCampaignById,
  getUserTaskCompletions,
  createTaskCompletion,
  createTaskReview,
} from "@/lib/models";
import { mockTasks } from "@/lib/mock-data";

const querySchema = z.object({
  userId: z.string().min(1),
});

const completeSchema = z.object({
  userId: z.string().min(1),
  taskId: z.string().min(1),
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

  let tasks = mockTasks.filter((t) => t.status === "active");

  if (dbAvailable) {
    const dbTasks = await getActiveTasks();
    if (dbTasks.length > 0) {
      tasks = dbTasks;
    }
  }

  const completions = dbAvailable ? await getUserTaskCompletions(userId) : [];
  const completedTaskIds = new Set(completions.map((c) => c.taskId));

  return NextResponse.json({
    tasks,
    completedTaskIds: Array.from(completedTaskIds),
  });
}

export async function POST(request: NextRequest) {
  const parsed = completeSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Некорректные данные", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { userId, taskId } = parsed.data;

  const task =
    (await getTaskById(taskId)) ??
    mockTasks.find((t) => t.id === taskId) ??
    null;

  if (!task) {
    return NextResponse.json({ error: "Задание не найдено" }, { status: 404 });
  }

  if (task.status !== "active") {
    return NextResponse.json({ error: "Задание не активно" }, { status: 400 });
  }

  const dbAvailable = await isDatabaseAvailable();

  if (!dbAvailable) {
    return NextResponse.json(
      { error: "База данных недоступна" },
      { status: 503 }
    );
  }

  const campaignId = task.campaignId;
  let advertiserId = task.advertiserId;

  if (!advertiserId && campaignId) {
    const campaign = await getCampaignById(campaignId);
    if (campaign) {
      advertiserId = campaign.advertiserId;
    }
  }

  if (!advertiserId) {
    return NextResponse.json(
      {
        error:
          "Не удалось определить рекламодателя задания. Проверка невозможна.",
      },
      { status: 400 }
    );
  }

  const completions = await getUserTaskCompletions(userId);
  const alreadyDone = completions.some((c) => c.taskId === taskId);

  if (alreadyDone) {
    return NextResponse.json(
      { error: "Вы уже выполнили это задание" },
      { status: 409 }
    );
  }

  await createTaskCompletion({
    taskId,
    userId,
    reward: task.reward,
    completedAt: new Date().toISOString(),
  });

  const review = await createTaskReview({
    taskId,
    userId,
    advertiserId,
    campaignId,
    reward: task.reward,
    status: "pending",
    taskTitle: task.title,
  });

  return NextResponse.json({
    success: true,
    reviewId: review.id,
    reward: task.reward,
    message: `Задание отправлено на проверку рекламодателю. Ожидайте подтверждения.`,
  });
}
