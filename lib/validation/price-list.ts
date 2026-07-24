import { z } from "zod";

export const updatePriceListItemSchema = z.object({
  id: z.string().min(1),
  price: z.number().min(0, "Цена должна быть неотрицательной"),
});

export type UpdatePriceListItemInput = z.infer<
  typeof updatePriceListItemSchema
>;
