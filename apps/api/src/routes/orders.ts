import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/orders/:orderId
router.get('/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          select: {
            id: true,
            nameSnapshot: true,
            priceCentsSnapshot: true,
            quantity: true,
          },
        },
        store: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Don't expose sensitive data
    const { pickupOtpHash, ...safeOrder } = order;

    res.json(safeOrder);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

export default router;
