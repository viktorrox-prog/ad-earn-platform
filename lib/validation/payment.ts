import { z } from "zod";

export const paymentInitSchema = z.object({
  userId: z.string().min(1).optional(),
  advertiserId: z.string().min(1).optional(),
  amount: z.number().positive("Сумма должна быть положительной"),
});

export type PaymentInitInput = z.infer<typeof paymentInitSchema>;
