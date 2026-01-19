const { PrismaClient } = require('../node_modules/@prisma/client');
const p = new PrismaClient();

async function main() {
  const stores = await p.store.findMany({
    include: {
      orders: {
        select: {
          id: true,
          status: true,
          paymentStatus: true,
          orderNumber: true,
          totalCents: true,
          createdAt: true,
        },
      },
    },
  });
  console.log(JSON.stringify(stores, null, 2));
}

main().catch((e) => console.error(e)).finally(async () => {
  await p.$disconnect();
});
