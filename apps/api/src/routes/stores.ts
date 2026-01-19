import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/stores/:slug/menu
router.get('/:slug/menu', async (req, res) => {
  try {
    const { slug } = req.params;

    const store = await prisma.store.findUnique({
      where: { slug },
      include: {
        menuItems: {
          where: { isAvailable: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Group items by category (description field)
    const groupedByCategory = store.menuItems.reduce(
      (acc: any, item: any) => {
        const category = item.description || 'OTHER';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push({
          id: item.id,
          name: item.name,
          category: item.description,
          priceCents: item.priceCents,
          price: (item.priceCents / 100).toFixed(2),
          imageUrl: item.imageUrl,
          isAvailable: item.isAvailable,
        });
        return acc;
      },
      {} as Record<
        string,
        Array<{
          id: string;
          name: string;
          category: string | null;
          priceCents: number;
          price: string;
          imageUrl: string | null;
          isAvailable: boolean;
        }>
      >
    );

    res.json({
      id: store.id,
      name: store.name,
      slug: store.slug,
      timezone: store.timezone,
      categories: groupedByCategory,
      itemCount: store.menuItems.length,
    });
  } catch (error) {
    console.error('Error fetching menu:', error);
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
});

export default router;
