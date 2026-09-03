import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isDatabaseAvailable } from "@/lib/db";
import {
  getAllCampaigns,
  updateCampaignStatus,
  createCampaign,
  MIN_VIEWS_BY_CAMPAIGN_TYPE,
} from "@/lib/models";
import { mockCampaigns } from "@/lib/mock-data";
import { adminCreateCampaignSchema } from "@/lib/validation/admin";

const moderateSchema = z.object({
  campaignId: z.string().min(1),
  status: z.enum(["active", "paused", "completed"]),
});

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
    const costPerView = Math.round(duration * 0.05 * 100) / 100;
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
    } catch (err) {
      console.warn("Failed to update campaign status in DB", err);
    }
  }

  const campaign = mockCampaigns.find((c) => c.id === campaignId);
  if (campaign) {
    campaign.status = status;
  }

  return NextResponse.json({ message: "Статус кампании обновлён" });
}
