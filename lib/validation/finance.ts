import { z } from "zod";

export const depositSchema = z.object({
  userId: z.string().min(1),
  amount: z.number().positive("Сумма должна быть положительной"),
  method: z.enum(["azvox"]),
});

export const withdrawSchema = z.object({
  userId: z.string().min(1),
  amount: z
    .number()
    .positive("Сумма должна быть положительной")
    .min(100, "Минимальная сумма вывода — 100 ₽"),
  method: z.enum(["card", "sbp"]),
  recipient: z.string().min(1, "Укажите реквизиты для вывода"),
});

export type DepositInput = z.infer<typeof depositSchema>;
export type WithdrawInput = z.infer<typeof withdrawSchema>;

