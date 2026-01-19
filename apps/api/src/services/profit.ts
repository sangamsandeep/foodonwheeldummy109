import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ProfitCalculation {
  grossProfitCents: number;
  netProfitCents: number;
  stripeFeeCents: number;
  commCostCents: number;
}

export function calculateOrderProfit(
  itemsRevenueCents: number,
  itemsCostCents: number,
  stripeFeeCents: number,
  commCostCents: number
): ProfitCalculation {
  const grossProfitCents = itemsRevenueCents - itemsCostCents;
  const netProfitCents = grossProfitCents - stripeFeeCents - commCostCents;

  return {
    grossProfitCents,
    netProfitCents,
    stripeFeeCents,
    commCostCents,
  };
}

export async function getDailySummary(storeId: string, date: string) {
  const startDate = new Date(date);
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = new Date(date);
  endDate.setHours(23, 59, 59, 999);

  const orders = await prisma.order.findMany({
    where: {
      storeId,
      paymentStatus: 'PAID',
      placedAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      totalCents: true,
      grossProfitCents: true,
      netProfitCents: true,
      stripeFeeCents: true,
      commCostCents: true,
    },
  });

  const summary = {
    date,
    orderCount: orders.length,
    totalRevenueCents: orders.reduce((sum: number, o: any) => sum + o.totalCents, 0),
    totalGrossProfitCents: orders.reduce((sum: number, o: any) => sum + (o.grossProfitCents || 0), 0),
    totalNetProfitCents: orders.reduce((sum: number, o: any) => sum + (o.netProfitCents || 0), 0),
    totalStripeFeeCents: orders.reduce((sum: number, o: any) => sum + (o.stripeFeeCents || 0), 0),
    totalCommCostCents: orders.reduce((sum: number, o: any) => sum + (o.commCostCents || 0), 0),
  };

  return summary;
}

export async function getItemWiseReport(storeId: string, dateFrom: string, dateTo: string) {
  const startDate = new Date(dateFrom);
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = new Date(dateTo);
  endDate.setHours(23, 59, 59, 999);

  const orderItems = await prisma.orderItem.findMany({
    where: {
      order: {
        storeId,
        paymentStatus: 'PAID',
        placedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    },
    select: {
      nameSnapshot: true,
      priceCentsSnapshot: true,
      costCentsSnapshot: true,
      quantity: true,
    },
  });

  // Group by item name
  const itemMap = new Map<string, {
    quantity: number;
    revenueCents: number;
    costCents: number;
  }>();

  for (const item of orderItems) {
    const existing = itemMap.get(item.nameSnapshot) || {
      quantity: 0,
      revenueCents: 0,
      costCents: 0,
    };

    existing.quantity += item.quantity;
    existing.revenueCents += item.priceCentsSnapshot * item.quantity;
    existing.costCents += item.costCentsSnapshot * item.quantity;

    itemMap.set(item.nameSnapshot, existing);
  }

  const report = Array.from(itemMap.entries()).map(([name, data]) => {
    const profitCents = data.revenueCents - data.costCents;
    const marginPercent = data.revenueCents > 0 
      ? ((profitCents / data.revenueCents) * 100).toFixed(2)
      : '0.00';

    return {
      itemName: name,
      quantity: data.quantity,
      revenueCents: data.revenueCents,
      costCents: data.costCents,
      profitCents,
      marginPercent: parseFloat(marginPercent),
    };
  });

  // Sort by revenue descending
  report.sort((a, b) => b.revenueCents - a.revenueCents);

  return report;
}
