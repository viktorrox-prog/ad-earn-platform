import { NextRequest, NextResponse } from "next/server";
import { createStandaloneTaskSchema } from "@/lib/validation/advertiser";
import { isDatabaseAvailable } from "@/lib/db";
import type {
  CampaignType,
  TaskPlatform,
  TaskActionType,
  TaskType,
} from "@/lib/models";
import {
  getAdvertiserById,
  getTasksByAdvertiser,
  createStandaloneTaskWithBalanceDeduct,
} from "@/lib/models";

function standaloneTaskMapping(type: CampaignType): {
  taskType: TaskType;
  platform: TaskPlatform;
  actionType: TaskActionType;
} {
  switch (type) {
    case "video":
      return { taskType: "social", platform: "youtube", actionType: "watch" };
    case "banner":
      return { taskType: "social", platform: "other", actionType: "watch" };
    case "cpc":
      return { taskType: "cpc", platform: "cpc", actionType: "cpc" };
    case "survey":
      return { taskType: "survey", platform: "survey", actionType: "survey" };
    case "app_install":
      return {
        taskType: "app_install",
        platform: "app",
        actionType: "install",
      };
    case "subscription":
      return {
        taskType: "subscription",
        platform: "telegram",
        actionType: "subscribe",
      };
  }
}

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
  let tasks: {
    id: string;
    title: string;
    description: string;
    type: string;
    url: string;
    reward: number;
    status: string;
    createdAt: string;
  }[] = [];

  if (dbAvailable) {
    const dbTasks = await getTasksByAdvertiser(advertiserId);
    tasks = dbTasks.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      type: t.taskType,
      url: t.url,
      reward: t.reward,
      status: t.status,
      createdAt: t.createdAt,
    }));
  }

  return NextResponse.json({ tasks });
}

export async function POST(request: NextRequest) {
  const parsed = createStandaloneTaskSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Некорректные данные", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { advertiserId, title, description, type, url, reward } = parsed.data;

  const dbAvailable = await isDatabaseAvailable();

  if (!dbAvailable) {
    return NextResponse.json(
      { error: "База данных недоступна" },
      { status: 503 }
    );
  }

  const advertiser = await getAdvertiserById(advertiserId);
  if (!advertiser) {
    return NextResponse.json(
      { error: "Рекламодатель не найден" },
      { status: 404 }
    );
  }

  if (reward > advertiser.balance) {
    return NextResponse.json(
      { error: "Недостаточно средств на балансе" },
      { status: 400 }
    );
  }

  const mapping = standaloneTaskMapping(type);

  const updated = await createStandaloneTaskWithBalanceDeduct(
    advertiserId,
    {
      title,
      description: description || `Задание: ${title}`,
      platform: mapping.platform,
      actionType: mapping.actionType,
      taskType: mapping.taskType,
      url,
      reward,
      status: "active",
    },
    reward
  );
  if (!updated) {
    return NextResponse.json(
      { error: "Недостаточно средств на балансе" },
      { status: 400 }
    );
  }

  const { task } = updated;

  return NextResponse.json({
    task: {
      id: task.id,
      title: task.title,
      description: task.description,
      type: task.taskType,
      url: task.url,
      reward: task.reward,
      status: task.status,
      createdAt: task.createdAt,
    },
    remainingBalance: updated.balance,
    message: "Задание создано и опубликовано для пользователей",
  });
}
