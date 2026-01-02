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
import { JobStage } from '../drizzle/types';

const JOB_STAGES: JobStage[] = [
  'CREATED', 'INSPECTION', 'ESTIMATE', 'CUSTOMER_APPROVAL',
  'WORK_IN_PROGRESS', 'QC', 'BILLING', 'DELIVERY', 'CLOSED'
];

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

    const vehiclesIn = await this.db.select({ count: count() }).from(jobCards)
      .where(and(eq(jobCards.workshopId, workshopId), gte(jobCards.entryTime, todayStr)));

    const jobsInProgress = await this.db.select({ count: count() }).from(jobCards)
      .where(and(eq(jobCards.workshopId, workshopId), eq(jobCards.stage, 'WORK_IN_PROGRESS')));

    const jobsCompleted = await this.db.select({ count: count() }).from(jobCards)
      .where(and(
        eq(jobCards.workshopId, workshopId),
        eq(jobCards.stage, 'CLOSED'),
        gte(jobCards.updatedAt, todayStr)
      ));

    const pendingDeliveries = await this.db.select({ count: count() }).from(jobCards)
      .where(and(eq(jobCards.workshopId, workshopId), eq(jobCards.stage, 'BILLING')));

    const pendingApprovals = await this.db.select({ count: count() }).from(jobCards)
      .where(and(eq(jobCards.workshopId, workshopId), eq(jobCards.stage, 'CUSTOMER_APPROVAL')));

    const pendingPayments = await this.db.select({ count: count() }).from(invoices)
      .where(and(eq(invoices.workshopId, workshopId), gt(invoices.balance, 0)));

    const revenueResult = await this.db.select({ sum: sum(invoices.grandTotal) }).from(invoices)
      .where(and(eq(invoices.workshopId, workshopId), gte(invoices.invoiceDate, todayStr)));
    const revenue = parseFloat(revenueResult[0].sum || '0');

    const allItems = await this.db.query.inventoryItems.findMany({
      where: eq(inventoryItems.workshopId, workshopId),
      with: { inventoryBatches: true },
    });
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
    const stages = JOB_STAGES;
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
          sql`${invoices.invoiceDate} < ${nextDateStr}`
        ));

      data.push({
        date: date.toISOString().split('T')[0],
        revenue: parseFloat(result[0].sum || '0'),
      });
    }

    return data;
  }

  async getTopServices(workshopId: string, limit: number = 5) {
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
