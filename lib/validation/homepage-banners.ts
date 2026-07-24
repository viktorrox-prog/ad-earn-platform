import { z } from "zod";

export const purchaseHomepageBannerSchema = z.object({
  userId: z.string().min(1),
  imageUrl: z.string().url("Некорректная ссылка на изображение"),
  targetUrl: z.string().url("Некорректная целевая ссылка"),
  days: z.number().int().min(1).max(30),
});

export type PurchaseHomepageBannerInput = z.infer<
  typeof purchaseHomepageBannerSchema
>;

export const moderateHomepageBannerSchema = z.object({
  status: z.enum(["active", "rejected"]),
});

export type ModerateHomepageBannerInput = z.infer<
  typeof moderateHomepageBannerSchema
>;
