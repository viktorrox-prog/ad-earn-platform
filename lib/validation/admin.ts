import { z } from "zod";

export const adminLoginSchema = z.object({
  email: z.string().email("Некорректный email"),
  password: z.string().min(1, "Введите пароль"),
});

export const updateUserBlockSchema = z.object({
  blocked: z.boolean(),
});

export const adminCreateCampaignSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(1000).optional(),
  type: z.enum([
    "video",
    "banner",
    "cpc",
    "survey",
    "app_install",
    "subscription",
  ]),
  mediaUrl: z.string().url().optional().or(z.literal("")),
  targetUrl: z.string().url().optional().or(z.literal("")),
  taskDescription: z.string().max(2000).optional().or(z.literal("")),
  duration: z.number().int().min(10),
  views: z.number().int().min(1),
});

export const moderateCampaignSchema = z.object({
  status: z.enum(["active", "paused", "completed"]),
});

export const approveWithdrawalSchema = z.object({
  action: z.enum(["approve", "reject"]),
});

export const respondTicketSchema = z.object({
  adminResponse: z
    .string()
    .min(1, "Введите ответ")
    .max(5000, "Ответ слишком длинный"),
});

export const createTicketSchema = z.object({
  userId: z.string().min(1),
  subject: z.string().min(1, "Введите тему").max(200),
  message: z.string().min(1, "Введите сообщение").max(5000),
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
export type RespondTicketInput = z.infer<typeof respondTicketSchema>;
export type CreateTicketInput = z.infer<typeof createTicketSchema>;

export const createBroadcastSchema = z.object({
  title: z.string().min(1, "Введите заголовок").max(200),
  message: z.string().min(1, "Введите сообщение").max(5000),
});

export type CreateBroadcastInput = z.infer<typeof createBroadcastSchema>;

export const updateAdminSettingsSchema = z.object({
  minCostPerView: z.number().min(1, "Цена должна быть не менее 1 ₽").max(10000),
  minViews: z.number().int().min(100, "Минимум 100 просмотров").max(10000000),
});

export type UpdateAdminSettingsInput = z.infer<
  typeof updateAdminSettingsSchema
>;
