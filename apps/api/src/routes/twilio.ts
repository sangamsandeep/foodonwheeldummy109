import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { generateOrderReadyTwiML } from '../services/voice';

const router = Router();
const prisma = new PrismaClient();

// GET /api/twilio/voice/order-ready
router.get('/voice/order-ready', (req: Request, res: Response) => {
  const { orderNumber } = req.query;

  if (!orderNumber) {
    return res.status(400).send('Missing orderNumber');
  }

  const twiml = generateOrderReadyTwiML(parseInt(orderNumber as string, 10));
  
  res.type('text/xml');
  res.send(twiml);
});

// POST /api/twilio/voice/status
router.post('/voice/status', async (req: Request, res: Response) => {
  try {
    const { CallSid, CallStatus, ErrorCode } = req.body;

    if (!CallSid) {
      return res.status(400).json({ error: 'Missing CallSid' });
    }

    // Update call log
    await prisma.callLog.updateMany({
      where: { twilioCallSid: CallSid },
      data: {
        status: CallStatus,
        errorCode: ErrorCode || null,
      },
    });

    res.json({ received: true });
  } catch (error) {
    console.error('Error updating call status:', error);
    res.status(500).json({ error: 'Failed to update call status' });
  }
});

export default router;
