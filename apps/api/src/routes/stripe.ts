import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';
import { env } from '../config/env';
import { stripe, calculateStripeFee } from '../services/payment';
import { generateOTP, hashOTP, getOTPExpiry } from '../services/otp';
import { sendOTPSMS } from '../services/sms';
import { calculateOrderProfit } from '../services/profit';

const router = Router();
const prisma = new PrismaClient();

// POST /api/stripe/webhook
router.post(
  '/webhook',
  async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'] as string;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      try {
        const orderId = session.metadata?.orderId;

        if (!orderId) {
          console.error('No orderId in session metadata');
          return res.status(400).json({ error: 'No orderId in metadata' });
        }

        const order = await prisma.order.findUnique({
          where: { id: orderId },
          include: { items: true },
        });

        if (!order) {
          console.error('Order not found:', orderId);
          return res.status(404).json({ error: 'Order not found' });
        }

        // Calculate profit metrics
        const itemsRevenueCents = order.subtotalCents;
        const itemsCostCents = order.items.reduce(
          (sum, item) => sum + item.costCentsSnapshot * item.quantity,
          0
        );

        const stripeFeeCents = calculateStripeFee(order.totalCents);
        
        // Generate OTP
        const otp = generateOTP();
        const otpHash = hashOTP(otp);
        const otpExpiry = getOTPExpiry();

        // Send OTP SMS
        let smsCostCents = 0;
        if (order.consentSms) {
          const smsResult = await sendOTPSMS(
            order.customerPhoneE164,
            order.orderNumber,
            otp
          );
          
          if (smsResult.success) {
            smsCostCents = smsResult.cost || 0;
          } else {
            console.error('Failed to send OTP SMS:', smsResult.error);
          }
        }

        const commCostCents = smsCostCents;

        const profitCalc = calculateOrderProfit(
          itemsRevenueCents,
          itemsCostCents,
          stripeFeeCents,
          commCostCents
        );

        // Update order
        await prisma.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: 'PAID',
            status: 'PLACED',
            placedAt: new Date(),
            stripeCheckoutSessionId: session.id,
            stripePaymentIntentId: session.payment_intent as string,
            pickupOtpHash: otpHash,
            pickupOtpLast4: otp.slice(-4),
            pickupOtpExpiresAt: otpExpiry,
            pickupOtpAttempts: 0,
            stripeFeeCents,
            commCostCents,
            grossProfitCents: profitCalc.grossProfitCents,
            netProfitCents: profitCalc.netProfitCents,
          },
        });

        // Create payment record
        await prisma.payment.create({
          data: {
            orderId: order.id,
            provider: 'stripe',
            amountCents: order.totalCents,
            currency: order.currency,
            status: 'succeeded',
            stripeCheckoutSessionId: session.id,
            stripePaymentIntentId: session.payment_intent as string,
            receiptUrl: (session as any).receipt_url || null,
          },
        });

        console.log(`✅ Order ${order.orderNumber} processed successfully`);
      } catch (error) {
        console.error('Error processing webhook:', error);
        return res.status(500).json({ error: 'Failed to process webhook' });
      }
    }

    res.json({ received: true });
  }
);

export default router;
