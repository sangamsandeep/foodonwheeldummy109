const { PrismaClient } = require('../node_modules/@prisma/client');
const p = new PrismaClient();

async function main() {
  const res = await p.order.updateMany({
    data: {
      paymentStatus: 'PAID',
      placedAt: new Date(),
    },
  });
  console.log(res);
}

main().catch((e) => console.error(e)).finally(async () => {
  await p.$disconnect();
});
