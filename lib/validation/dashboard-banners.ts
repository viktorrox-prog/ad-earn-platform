import { z } from "zod";

export const purchaseDashboardBannerSchema = z.object({
  userId: z.string().min(1),
  imageUrl: z.string().url("Некорректная ссылка на изображение"),
  targetUrl: z.string().url("Некорректная целевая ссылка"),
  days: z.number().int().min(1).max(30),
});

export type PurchaseDashboardBannerInput = z.infer<
  typeof purchaseDashboardBannerSchema
>;

export const moderateDashboardBannerSchema = z.object({
  status: z.enum(["active", "rejected"]),
});

export type ModerateDashboardBannerInput = z.infer<
  typeof moderateDashboardBannerSchema
>;
