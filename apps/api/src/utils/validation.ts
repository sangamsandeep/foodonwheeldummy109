import { z } from 'zod';

export const checkoutSchema = z.object({
  storeId: z.string().uuid(),
  cartItems: z.array(
    z.object({
      menuItemId: z.string().uuid(),
      quantity: z.number().int().min(1).max(99),
    })
  ).min(1),
  phoneE164: z.string().regex(/^\+[1-9]\d{1,14}$/),
  consentCall: z.boolean(),
  consentSms: z.boolean(),
  tipCents: z.number().int().min(0).optional().default(0),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PREPARING', 'READY']),
});

export const completeOrderSchema = z.object({
  otp: z.string().length(6).regex(/^\d{6}$/),
});
