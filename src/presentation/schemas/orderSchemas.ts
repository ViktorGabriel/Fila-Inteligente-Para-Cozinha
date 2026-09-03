import { z } from 'zod';

export const createOrderSchema = z.object({
  customerName: z.string().min(1, 'Customer name is required'),
  slaDeliveryMinutes: z.number().int().positive('SLA delivery minutes must be greater than zero'),
  items: z
    .array(
      z.object({
        name: z.string().min(1, 'Item name is required'),
        quantity: z.number().int().positive('Quantity must be greater than zero'),
        prepTimeMinutes: z.number().int().positive('Prep time must be greater than zero'),
      })
    )
    .min(1, 'Order must contain at least one item'),
});

export const changeOrderStatusSchema = z.object({
  status: z.enum(['IN_PREPARATION', 'READY'], {
    message: "Status must be either 'IN_PREPARATION' or 'READY'",
  }),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type ChangeOrderStatusInput = z.infer<typeof changeOrderStatusSchema>;
