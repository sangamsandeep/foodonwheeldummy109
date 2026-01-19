import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearAndSeed() {
  try {
    console.log('🗑️  Deleting existing menu items...');
    const store = await prisma.store.findUnique({
      where: { slug: 'downtown-cafe' },
    });

    if (!store) {
      console.error('Store not found');
      process.exit(1);
    }

    // Get count before
    const countBefore = await prisma.menuItem.count({
      where: { storeId: store.id },
    });

    if (countBefore > 0) {
      // Delete all order items that reference these menu items first
      const menuIds = await prisma.menuItem.findMany({
        where: { storeId: store.id },
        select: { id: true },
      });

      await prisma.orderItem.deleteMany({
        where: {
          menuItemId: { in: menuIds.map((m) => m.id) },
        },
      });

      // Now delete menu items
      await prisma.menuItem.deleteMany({
        where: { storeId: store.id },
      });

      console.log(`✅ Deleted ${countBefore} items`);
    } else {
      console.log('No items to delete');
    }

    console.log('✨ Database cleared and ready for new seed');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

clearAndSeed();
