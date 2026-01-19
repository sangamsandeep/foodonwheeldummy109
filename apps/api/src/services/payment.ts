import Stripe from 'stripe';
import { env } from '../config/env';

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
});

export { stripe };

export function calculateStripeFee(amountCents: number): number {
  // Stripe fee: 2.9% + $0.30
  const percentageFee = Math.round(amountCents * 0.029);
  const fixedFee = 30; // cents
  return percentageFee + fixedFee;
}
