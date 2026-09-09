import { NextRequest, NextResponse } from "next/server";
import { createCampaignSchema } from "@/lib/validation/advertiser";
import { isDatabaseAvailable } from "@/lib/db";
import type {
  CampaignType,
  TaskPlatform,
  TaskActionType,
  TaskType,
} from "@/lib/models";
import {
  getAdvertiserById,
  getCampaignsByAdvertiserId,
  createCampaign,
  createAd,
  creditReferralReward,
  getAdminSettings,
  createTask,
  MIN_VIEWS_BY_CAMPAIGN_TYPE,
} from "@/lib/models";
import {
  mockAdvertisers,
  mockCampaigns,
  mockAdminSettings,
} from "@/lib/mock-data";

function campaignTypeToTaskMapping(type: CampaignType): {
  taskType: TaskType;
  platform: TaskPlatform;
  actionType: TaskActionType;
} | null {
  switch (type) {
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
    default:
      return null;
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
  let campaigns = mockCampaigns.filter((c) => c.advertiserId === advertiserId);

  if (dbAvailable) {
    const dbCampaigns = await getCampaignsByAdvertiserId(advertiserId);
    if (dbCampaigns.length > 0) {
      campaigns = dbCampaigns;
    }
  }

  return NextResponse.json({ campaigns });
}

export async function POST(request: NextRequest) {
  const parsed = createCampaignSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Некорректные данные", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const {
    advertiserId,
    title,
    description,
    type,
    mediaUrl,
    targetUrl,
    taskDescription,
    views,
    duration,
  } = parsed.data;

  const costPerView = Math.round(duration * 0.055 * 100) / 100;
  const budget = views * costPerView;

  let settings = mockAdminSettings;
  const dbAvailable = await isDatabaseAvailable();
  if (dbAvailable) {
    const dbSettings = await getAdminSettings();
    if (dbSettings) {
      settings = dbSettings;
    }
  }

  if (costPerView < settings.minCostPerView) {
    return NextResponse.json(
      {
        error: `Цена за просмотр не может быть менее ${settings.minCostPerView} ₽`,
      },
      { status: 400 }
    );
  }

  const minViews = MIN_VIEWS_BY_CAMPAIGN_TYPE[type];
  if (views < minViews) {
    return NextResponse.json(
      {
        error: `Для типа «${type === "video" ? "Видео" : type === "banner" ? "Баннер" : type === "cpc" ? "CPC" : type === "survey" ? "Опрос" : type === "app_install" ? "Установка приложения" : "Подписка"}» минимум ${minViews} ${type === "video" || type === "banner" ? "просмотров" : "действий"}`,
      },
      { status: 400 }
    );
  }

  let advertiser = null;

  if (dbAvailable) {
    advertiser = await getAdvertiserById(advertiserId);
  } else {
    advertiser = mockAdvertisers.find((a) => a.id === advertiserId) ?? null;
  }

  if (!advertiser) {
    return NextResponse.json(
      { error: "Рекламодатель не найден" },
      { status: 404 }
    );
  }

  if (budget > advertiser.balance) {
    return NextResponse.json(
      { error: "Недостаточно средств на балансе" },
      { status: 400 }
    );
  }

  if (dbAvailable) {
    // Бюджет заранее НЕ списываем: оплата происходит за каждый реальный
    // просмотр в recordCampaignView (app/api/ads/watch). Если списать весь
    // бюджет здесь, то на момент показа на балансе может не остаться средств,
    // и транзакция recordCampaignView будет откатываться, а статистика кампании
    // (показы/расходы) не станет обновляться. Поэтому здесь только проверяем,
    // что на балансе достаточно средств на весь бюджет кампании.
    const campaign = await createCampaign({
      advertiserId,
      title,
      description,
      type,
      mediaUrl: mediaUrl || undefined,
      targetUrl: targetUrl || undefined,
      taskDescription: taskDescription || undefined,
      budget,
      duration,
      costPerView,
      status: "active",
    });

    if (advertiser.referredBy) {
      await creditReferralReward(
        advertiser.referredBy,
        budget,
        advertiser.companyName
      );
    }

    const isAdType = type === "video" || type === "banner" || type === "cpc";
    if (isAdType && (mediaUrl || targetUrl)) {
      await createAd({
        title,
        description,
        type: type as "video" | "banner" | "cpc",
        mediaUrl: mediaUrl || undefined,
        targetUrl: targetUrl || undefined,
        reward: costPerView,
        duration,
        status: "active",
        campaignId: campaign.id,
        advertiserId,
      });
    }

    const taskMapping = campaignTypeToTaskMapping(type);
    if (taskMapping) {
      await createTask({
        title,
        description: taskDescription || `Задание: ${title}`,
        platform: taskMapping.platform,
        actionType: taskMapping.actionType,
        taskType: taskMapping.taskType,
        url: targetUrl || mediaUrl || "",
        reward: costPerView,
        status: "active",
        campaignId: campaign.id,
      });
    }

    return NextResponse.json({
      ...campaign,
      remainingBalance: advertiser.balance,
    });
  }

  const { randomUUID } = await import("crypto");
  return NextResponse.json({
    id: randomUUID(),
    advertiserId,
    title,
    description,
    type,
    mediaUrl: mediaUrl || undefined,
    targetUrl: targetUrl || undefined,
    taskDescription: taskDescription || undefined,
    budget,
    duration,
    costPerView,
    status: "active",
    views: 0,
    clicks: 0,
    spend: 0,
    remainingBalance: advertiser.balance,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}
