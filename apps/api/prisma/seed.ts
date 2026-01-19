import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create a sample store
  const store = await prisma.store.upsert({
    where: { slug: 'downtown-cafe' },
    update: {},
    create: {
      name: 'Downtown Cafe',
      slug: 'downtown-cafe',
      timezone: 'America/New_York',
    },
  });

  console.log(`✅ Created store: ${store.name}`);

  // Create sample menu items
  const menuItems = [
    {
      name: 'Espresso',
      description: 'Rich and bold espresso shot',
      priceCents: 350,
      costCents: 80,
      sortOrder: 1,
    },
    {
      name: 'Cappuccino',
      description: 'Espresso with steamed milk and foam',
      priceCents: 500,
      costCents: 120,
      sortOrder: 2,
    },
    {
      name: 'Latte',
      description: 'Smooth espresso with steamed milk',
      priceCents: 550,
      costCents: 130,
      sortOrder: 3,
    },
    {
      name: 'Croissant',
      description: 'Buttery, flaky pastry',
      priceCents: 450,
      costCents: 150,
      sortOrder: 4,
    },
    {
      name: 'Avocado Toast',
      description: 'Fresh avocado on sourdough',
      priceCents: 950,
      costCents: 350,
      sortOrder: 5,
    },
    {
      name: 'Caesar Salad',
      description: 'Crisp romaine with parmesan and croutons',
      priceCents: 1200,
      costCents: 450,
      sortOrder: 6,
    },
  ];

  for (const item of menuItems) {
    const existing = await prisma.menuItem.findFirst({
      where: {
        storeId: store.id,
        name: item.name,
      },
    });

    if (!existing) {
      await prisma.menuItem.create({
        data: {
          ...item,
          storeId: store.id,
          isAvailable: true,
        },
      });
    }
  }

  console.log(`✅ Created ${menuItems.length} menu items`);

  console.log('🎉 Seed completed!');
  console.log(`\n📋 Store URL: /store/${store.slug}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
