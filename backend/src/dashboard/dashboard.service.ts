import { Injectable, Inject } from '@nestjs/common';
import { DrizzleAsyncProvider } from '../drizzle/drizzle.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../drizzle/schema';
import {
  jobCards,
  invoices,
  inventoryItems,
  inventoryBatches,
  jobItems,
} from '../drizzle/schema';
import { eq, and, gte, gt, lte, desc, sum, count, sql } from 'drizzle-orm';
import { JobStage } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(
    @Inject(DrizzleAsyncProvider)
    private db: NodePgDatabase<typeof schema>,
  ) { }

  async getKPIs(workshopId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString();

    // Helper: count query
    const countQuery = async((table, condition) => {
      const res = await this.db.select({ count: count() }).from(table).where(condition);
      return res[0].count;
    });

    // Vehicles In (today)
    const vehiclesIn = await this.db.select({ count: count() }).from(jobCards)
      .where(and(eq(jobCards.workshopId, workshopId), gte(jobCards.entryTime, todayStr)));

    // Jobs In Progress
    const jobsInProgress = await this.db.select({ count: count() }).from(jobCards)
      .where(and(eq(jobCards.workshopId, workshopId), eq(jobCards.stage, 'WORK_IN_PROGRESS')));

    // Jobs Completed (today)
    // updatedAt check for completion today?
    const jobsCompleted = await this.db.select({ count: count() }).from(jobCards)
      .where(and(
        eq(jobCards.workshopId, workshopId),
        eq(jobCards.stage, 'CLOSED'),
        gte(jobCards.updatedAt, todayStr)
      ));

    // Pending Deliveries
    const pendingDeliveries = await this.db.select({ count: count() }).from(jobCards)
      .where(and(eq(jobCards.workshopId, workshopId), eq(jobCards.stage, 'BILLING')));

    // Pending Approvals
    const pendingApprovals = await this.db.select({ count: count() }).from(jobCards)
      .where(and(eq(jobCards.workshopId, workshopId), eq(jobCards.stage, 'CUSTOMER_APPROVAL')));

    // Pending Payments
    const pendingPayments = await this.db.select({ count: count() }).from(invoices)
      .where(and(eq(invoices.workshopId, workshopId), gt(invoices.balance, 0)));

    // Revenue (today)
    const revenueResult = await this.db.select({ sum: sum(invoices.grandTotal) }).from(invoices)
      .where(and(eq(invoices.workshopId, workshopId), gte(invoices.invoiceDate, todayStr)));
    const revenue = parseFloat(revenueResult[0].sum || '0');

    // Low Stock Items
    // Complex query: find items where ANY batch has quantity <= 10?
    // Prisma query was: items where batches SOME quantity lte 10.
    // Drizzle doesn't support easy "some" in filters yet without subqueries or joins.
    // We can fetch items with batches, then filter in memory (easy) or write smart join.
    // Given load, let's fetch items + batches and filter. Or use SQL exists.
    // Using simple fetch and filter for now as MVP.
    // Actually, SQL `EXISTS` is better.
    // select * from items where exists (select 1 from batches where itemId = items.id and quantity <= 10)
    // Drizzle: where(exists(...))
    /*
    const lowStockItems = await this.db.select().from(inventoryItems)
        .where(and(
            eq(inventoryItems.workshopId, workshopId),
            exists(
                this.db.select().from(inventoryBatches)
                .where(and(
                    eq(inventoryBatches.itemId, inventoryItems.id),
                    lte(inventoryBatches.quantity, 10)
                ))
            )
        ))
        .limit(5);
    */
    // Since I need to select specific fields and include count...
    // Let's iterate.
    const allItems = await this.db.query.inventoryItems.findMany({
      where: eq(inventoryItems.workshopId, workshopId),
      with: { inventoryBatches: true }, // 'batches'
    });
    // Filter in memory for simplicity/speed dev
    const lowStock = allItems.filter(i => i.inventoryBatches.some(b => b.quantity <= 10));
    const lowStockItemsFull = lowStock.slice(0, 5).map(i => ({
      id: i.id,
      name: i.name,
      batches: i.inventoryBatches.map(b => ({ quantity: b.quantity }))
    }));

    return {
      vehiclesIn: vehiclesIn[0].count,
      jobsInProgress: jobsInProgress[0].count,
      jobsCompleted: jobsCompleted[0].count,
      pendingDeliveries: pendingDeliveries[0].count,
      pendingApprovals: pendingApprovals[0].count,
      pendingPayments: pendingPayments[0].count,
      revenue,
      lowStockCount: lowStock.length,
      lowStockItems: lowStockItemsFull,
      recentJobs: await this.db.query.jobCards.findMany({
        where: eq(jobCards.workshopId, workshopId),
        orderBy: [desc(jobCards.createdAt)],
        limit: 5,
        with: { vehicle: true, customer: true },
      }),
    };
  }

  async getJobStatusFunnel(workshopId: string) {
    const stages = Object.values(JobStage);
    const funnel = [];

    for (const stage of stages) {
      const countRes = await this.db.select({ count: count() }).from(jobCards)
        .where(and(eq(jobCards.workshopId, workshopId), eq(jobCards.stage, stage)));
      funnel.push({ stage, count: countRes[0].count });
    }

    return funnel;
  }

  async getRevenueGraph(workshopId: string, days: number = 7) {
    const data = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const dateStr = date.toISOString();

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      const nextDateStr = nextDate.toISOString();

      const result = await this.db.select({ sum: sum(invoices.grandTotal) }).from(invoices)
        .where(and(
          eq(invoices.workshopId, workshopId),
          gte(invoices.invoiceDate, dateStr),
          sql`${invoices.invoiceDate} < ${nextDateStr}` // using simple sql operator for less than
        )); // or user lt()

      data.push({
        date: date.toISOString().split('T')[0],
        revenue: parseFloat(result[0].sum || '0'),
      });
    }

    return data;
  }

  async getTopServices(workshopId: string, limit: number = 5) {
    // Group by description
    /*
    await this.prisma.jobItem.groupBy({
        by: ['description'],
        _count: ...,
        _sum: ...
    })
    */
    // Drizzle group by
    const tasks = await this.db.select({
      description: jobItems.description,
      count: count(jobItems.description),
      revenue: sum(jobItems.price)
    })
      .from(jobItems)
      .innerJoin(jobCards, eq(jobItems.jobCardId, jobCards.id))
      .where(eq(jobCards.workshopId, workshopId))
      .groupBy(jobItems.description)
      .orderBy(desc(count(jobItems.description)))
      .limit(limit);

    return tasks.map((task) => ({
      service: task.description,
      count: task.count,
      revenue: parseFloat(task.revenue || '0'),
    }));
  }
}
