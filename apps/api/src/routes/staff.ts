import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { staffAuth } from '../middleware/auth';
import { otpRateLimiter } from '../middleware/rateLimiter';
import { updateOrderStatusSchema, completeOrderSchema } from '../utils/validation';
import { generateOTP, hashOTP, getOTPExpiry, verifyOTP } from '../services/otp';
import { sendOTPSMS } from '../services/sms';
import { makeOrderReadyCall } from '../services/voice';
import { calculateOrderProfit } from '../services/profit';
import { getDailySummary, getItemWiseReport } from '../services/profit';

const router = Router();
const prisma = new PrismaClient();

// All staff routes require authentication
router.use(staffAuth);

// GET /api/staff/orders
router.get('/orders', async (req: Request, res: Response) => {
  try {
    const { storeId, status } = req.query;

    if (!storeId) {
      return res.status(400).json({ error: 'storeId is required' });
    }

    const where: any = { storeId: storeId as string };
    
    if (status) {
      where.status = status;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          select: {
            nameSnapshot: true,
            quantity: true,
            priceCentsSnapshot: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// POST /api/staff/orders/:orderId/status
router.post('/orders/:orderId/status', async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const body = updateOrderStatusSchema.parse(req.body);

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.paymentStatus !== 'PAID') {
      return res.status(400).json({ error: 'Order must be paid before status change' });
    }

    const updateData: any = {
      status: body.status,
    };

    // If setting to READY, make the call
    if (body.status === 'READY' && order.consentCall) {
      updateData.readyAt = new Date();

      const callResult = await makeOrderReadyCall(
        order.customerPhoneE164,
        order.orderNumber,
        order.id
      );

      // Log the call
      await prisma.callLog.create({
        data: {
          orderId: order.id,
          toPhoneE164: order.customerPhoneE164,
          fromPhoneE164: process.env.TWILIO_FROM_NUMBER!,
          twilioCallSid: callResult.callSid,
          status: callResult.success ? 'initiated' : 'failed',
          errorCode: callResult.error,
        },
      });

      // Update comm costs
      const currentCommCost = order.commCostCents || 0;
      updateData.commCostCents = currentCommCost + (callResult.cost || 0);
      
      // Recalculate net profit
      if (order.grossProfitCents !== null && order.stripeFeeCents !== null) {
        updateData.netProfitCents = 
          order.grossProfitCents - order.stripeFeeCents - updateData.commCostCents;
      }
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
    });

    res.json(updatedOrder);
  } catch (error: any) {
    console.error('Error updating order status:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// POST /api/staff/orders/:orderId/complete
router.post('/orders/:orderId/complete', otpRateLimiter, async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const body = completeOrderSchema.parse(req.body);

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status !== 'READY') {
      return res.status(400).json({ error: 'Order must be in READY status' });
    }

    if (order.paymentStatus !== 'PAID') {
      return res.status(400).json({ error: 'Order must be paid' });
    }

    if (!order.pickupOtpHash || !order.pickupOtpExpiresAt) {
      return res.status(400).json({ error: 'No OTP set for this order' });
    }

    if (new Date() > order.pickupOtpExpiresAt) {
      return res.status(400).json({ error: 'OTP has expired' });
    }

    if (order.pickupOtpAttempts >= 5) {
      return res.status(429).json({ error: 'Too many OTP attempts' });
    }

    // Verify OTP
    const isValid = verifyOTP(body.otp, order.pickupOtpHash);

    if (!isValid) {
      // Increment attempts
      await prisma.order.update({
        where: { id: orderId },
        data: {
          pickupOtpAttempts: order.pickupOtpAttempts + 1,
        },
      });

      return res.status(400).json({ 
        error: 'Invalid OTP',
        attemptsRemaining: 5 - (order.pickupOtpAttempts + 1),
      });
    }

    // OTP is valid - complete the order
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        pickupOtpHash: null, // Clear OTP for security
      },
    });

    res.json({ 
      success: true,
      order: updatedOrder,
    });
  } catch (error: any) {
    console.error('Error completing order:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to complete order' });
  }
});

// POST /api/staff/orders/:orderId/resend-otp
router.post('/orders/:orderId/resend-otp', otpRateLimiter, async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.paymentStatus !== 'PAID') {
      return res.status(400).json({ error: 'Order must be paid' });
    }

    if (!order.consentSms) {
      return res.status(400).json({ error: 'Customer did not consent to SMS' });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpHash = hashOTP(otp);
    const otpExpiry = getOTPExpiry();

    // Send SMS
    const smsResult = await sendOTPSMS(
      order.customerPhoneE164,
      order.orderNumber,
      otp
    );

    if (!smsResult.success) {
      return res.status(500).json({ error: 'Failed to send SMS' });
    }

    // Update order
    await prisma.order.update({
      where: { id: orderId },
      data: {
        pickupOtpHash: otpHash,
        pickupOtpLast4: otp.slice(-4),
        pickupOtpExpiresAt: otpExpiry,
        pickupOtpAttempts: 0,
        commCostCents: (order.commCostCents || 0) + (smsResult.cost || 0),
      },
    });

    res.json({ success: true, message: 'OTP resent successfully' });
  } catch (error) {
    console.error('Error resending OTP:', error);
    res.status(500).json({ error: 'Failed to resend OTP' });
  }
});

// GET /api/staff/reports/daily
router.get('/reports/daily', async (req: Request, res: Response) => {
  try {
    const { storeId, date } = req.query;

    if (!storeId || !date) {
      return res.status(400).json({ error: 'storeId and date are required' });
    }

    const summary = await getDailySummary(storeId as string, date as string);
    res.json(summary);
  } catch (error) {
    console.error('Error fetching daily report:', error);
    res.status(500).json({ error: 'Failed to fetch daily report' });
  }
});

// GET /api/staff/reports/items
router.get('/reports/items', async (req: Request, res: Response) => {
  try {
    const { storeId, dateFrom, dateTo } = req.query;

    if (!storeId || !dateFrom || !dateTo) {
      return res.status(400).json({ error: 'storeId, dateFrom, and dateTo are required' });
    }

    const report = await getItemWiseReport(
      storeId as string,
      dateFrom as string,
      dateTo as string
    );
    
    res.json(report);
  } catch (error) {
    console.error('Error fetching items report:', error);
    res.status(500).json({ error: 'Failed to fetch items report' });
  }
});

export default router;
