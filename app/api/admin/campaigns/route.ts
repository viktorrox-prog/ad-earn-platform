import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isDatabaseAvailable } from "@/lib/db";
import {
  getAllCampaigns,
  updateCampaignStatus,
  updateAdsStatusByCampaignId,
  updateTasksStatusByCampaignId,
  createCampaign,
  createAd,
  createTask,
  MIN_VIEWS_BY_CAMPAIGN_TYPE,
  type CampaignType,
  type TaskPlatform,
  type TaskActionType,
  type TaskType,
} from "@/lib/models";
import { mockAds, mockCampaigns, mockTasks } from "@/lib/mock-data";
import { adminCreateCampaignSchema } from "@/lib/validation/admin";

const moderateSchema = z.object({
  campaignId: z.string().min(1),
  status: z.enum(["active", "paused", "completed"]),
});

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

export async function GET() {
  const dbAvailable = await isDatabaseAvailable();
  let campaigns = mockCampaigns;
  if (dbAvailable) {
    try {
      const dbCampaigns = await getAllCampaigns();
      if (dbCampaigns.length > 0) {
        campaigns = dbCampaigns;
      }
    } catch (err) {
      console.warn("Failed to load campaigns from DB", err);
    }
  }

  const normalized = campaigns.map((c) => ({
    ...c,
    id: c.id ?? "",
    advertiserId: c.advertiserId ?? "",
    title: c.title ?? "Без названия",
    description: c.description ?? "",
    type: c.type ?? "video",
    status: c.status ?? "moderation",
    duration: Number(c.duration) || 0,
    budget: Number(c.budget) || 0,
    costPerView: Number(c.costPerView) || 0,
    views: Number(c.views) || 0,
    spend: Number(c.spend) || 0,
    clicks: Number(c.clicks) || 0,
    completions: Number(c.completions) || 0,
    createdAt: c.createdAt ?? new Date().toISOString(),
  }));

  return NextResponse.json({ campaigns: normalized });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const createParsed = adminCreateCampaignSchema.safeParse(body);
  if (createParsed.success) {
    const {
      title,
      description,
      type,
      mediaUrl,
      targetUrl,
      taskDescription,
      duration,
      views,
    } = createParsed.data;
    const costPerView = Math.round(duration * 0.055 * 100) / 100;
    const budget = views * costPerView;

    const minViews =
      MIN_VIEWS_BY_CAMPAIGN_TYPE[
        type as keyof typeof MIN_VIEWS_BY_CAMPAIGN_TYPE
      ];
    if (views < minViews) {
      return NextResponse.json(
        {
          error: `Для типа «${type === "video" ? "Видео" : type === "banner" ? "Баннер" : type === "cpc" ? "CPC" : type === "survey" ? "Опрос" : type === "app_install" ? "Установка приложения" : "Подписка"}» минимум ${minViews} ${type === "video" || type === "banner" ? "просмотров" : "действий"}`,
        },
        { status: 400 }
      );
    }

    const dbAvailable = await isDatabaseAvailable();

    if (dbAvailable) {
      try {
        const campaign = await createCampaign({
          advertiserId: "admin",
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

        const isAdType =
          type === "video" || type === "banner" || type === "cpc";
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
            advertiserId: "admin",
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
            advertiserId: "admin",
          });
        }

        return NextResponse.json(campaign);
      } catch (err) {
        console.warn("Failed to create campaign in DB", err);
      }
    }

    const { randomUUID } = await import("crypto");
    const now = new Date().toISOString();
    const campaign = {
      id: randomUUID(),
      advertiserId: "admin",
      title,
      description,
      type,
      mediaUrl: mediaUrl || undefined,
      targetUrl: targetUrl || undefined,
      taskDescription: taskDescription || undefined,
      budget,
      duration,
      costPerView,
      status: "active" as const,
      views: 0,
      clicks: 0,
      spend: 0,
      completions: 0,
      createdAt: now,
      updatedAt: now,
    };
    mockCampaigns.push(campaign);

    const isAdType = type === "video" || type === "banner" || type === "cpc";
    if (isAdType && (mediaUrl || targetUrl)) {
      mockAds.push({
        id: randomUUID(),
        title,
        description,
        type: type as "video" | "banner" | "cpc",
        mediaUrl: mediaUrl || undefined,
        targetUrl: targetUrl || undefined,
        reward: costPerView,
        duration,
        status: "active",
        campaignId: campaign.id,
        advertiserId: "admin",
        createdAt: now,
        updatedAt: now,
      });
    }

    const taskMapping = campaignTypeToTaskMapping(type);
    if (taskMapping) {
      mockTasks.push({
        id: randomUUID(),
        title,
        description: taskDescription || `Задание: ${title}`,
        platform: taskMapping.platform,
        actionType: taskMapping.actionType,
        taskType: taskMapping.taskType,
        url: targetUrl || mediaUrl || "",
        reward: costPerView,
        status: "active",
        campaignId: campaign.id,
        advertiserId: "admin",
        createdAt: now,
        updatedAt: now,
      });
    }

    return NextResponse.json(campaign);
  }

  const parsed = moderateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Некорректные данные", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { campaignId, status } = parsed.data;
  const dbAvailable = await isDatabaseAvailable();

  if (dbAvailable) {
    try {
      await updateCampaignStatus(campaignId, status);
      // Приостановка/завершение кампании должна отключать показ связанных
      // объявлений и заданий, активация — возвращать их в ленту.
      const adStatus = status === "active" ? "active" : "inactive";
      await updateAdsStatusByCampaignId(campaignId, adStatus);
      await updateTasksStatusByCampaignId(campaignId, adStatus);
    } catch (err) {
      console.warn("Failed to update campaign status in DB", err);
      return NextResponse.json(
        { error: "Не удалось обновить статус кампании" },
        { status: 500 }
      );
    }
  }

  const campaign = mockCampaigns.find((c) => c.id === campaignId);
  if (campaign) {
    campaign.status = status;
    const mockStatus = status === "active" ? "active" : "inactive";
    for (const ad of mockAds) {
      if (ad.campaignId === campaignId) ad.status = mockStatus;
    }
    for (const task of mockTasks) {
      if (task.campaignId === campaignId) task.status = mockStatus;
    }
  }

  return NextResponse.json({ message: "Статус кампании обновлён" });
}
