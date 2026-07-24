import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Некорректный email"),
  phone: z
    .string()
    .min(10, "Номер телефона должен содержать минимум 10 символов")
    .regex(/^\+?\d{10,15}$/, "Некорректный номер телефона"),
  password: z
    .string()
    .min(6, "Пароль должен содержать минимум 6 символов")
    .max(100),
});

export const verifySchema = z.object({
  target: z.string().min(1),
  code: z.string().length(6),
});

export const loginSchema = z.object({
  login: z.string().min(1, "Укажите email или номер телефона"),
  password: z.string().min(1, "Укажите пароль"),
});

export const resetPasswordSchema = z.object({
  target: z.string().min(1),
});

export const confirmResetSchema = z.object({
  target: z.string().min(1),
  code: z.string().length(6),
  password: z
    .string()
    .min(6, "Пароль должен содержать минимум 6 символов")
    .max(100),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type VerifyInput = z.infer<typeof verifySchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ConfirmResetInput = z.infer<typeof confirmResetSchema>;
