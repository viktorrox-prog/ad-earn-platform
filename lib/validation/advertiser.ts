import { z } from "zod";

export const advertiserRegisterSchema = z.object({
  companyName: z
    .string()
    .min(2, "Название компании минимум 2 символа")
    .max(200),
  email: z.string().email("Некорректный email"),
  phone: z
    .string()
    .min(10)
    .regex(/^\+?\d{10,15}$/, "Некорректный номер телефона"),
  password: z.string().min(6, "Пароль минимум 6 символов").max(100),
  refCode: z.string().optional(),
});

export const advertiserLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const topUpSchema = z.object({
  advertiserId: z.string().min(1),
  amount: z.number().positive("Сумма должна быть положительной"),
  method: z.enum(["robokassa", "yoomoney"]),
});

export const createCampaignSchema = z.object({
  advertiserId: z.string().min(1),
  title: z.string().min(2, "Название минимум 2 символа").max(200),
  description: z.string().max(1000).optional(),
  type: z.enum([
    "video",
    "banner",
    "cpc",
    "survey",
    "app_install",
    "subscription",
  ]),
  mediaUrl: z
    .string()
    .url("Некорректная ссылка на креатив")
    .optional()
    .or(z.literal("")),
  targetUrl: z
    .string()
    .url("Некорректная целевая ссылка")
    .optional()
    .or(z.literal("")),
  taskDescription: z.string().max(2000).optional().or(z.literal("")),
  views: z
    .number()
    .int("Количество просмотров должно быть целым числом")
    .min(1, "Введите количество просмотров"),
  duration: z
    .number()
    .int("Длительность должна быть целым числом секунд")
    .min(10, "Длительность не менее 10 секунд"),
});

export type AdvertiserRegisterInput = z.infer<typeof advertiserRegisterSchema>;
export type AdvertiserLoginInput = z.infer<typeof advertiserLoginSchema>;
export type TopUpInput = z.infer<typeof topUpSchema>;
export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
