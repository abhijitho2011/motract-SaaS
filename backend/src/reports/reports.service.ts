import { Injectable, Inject } from '@nestjs/common';
import { DrizzleAsyncProvider } from '../drizzle/drizzle.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../drizzle/schema';
import {
  invoices,
  purchases,
  purchaseItems,
  jobParts,
  expenses,
  jobCards,
} from '../drizzle/schema';
import { eq, and, gte, lte, desc, sum, count, isNotNull } from 'drizzle-orm';

@Injectable()
export class ReportsService {
  constructor(
    @Inject(DrizzleAsyncProvider)
    private db: NodePgDatabase<typeof schema>,
  ) { }

  async getSalesReport(workshopId: string, startDate: Date, endDate: Date) {
    const startStr = startDate.toISOString();
    const endStr = endDate.toISOString();

    // Aggregate Invoices
    const sales = await this.db.query.invoices.findMany({
      where: and(
        eq(invoices.workshopId, workshopId),
        gte(invoices.invoiceDate, startStr),
        lte(invoices.invoiceDate, endStr)
      ),
      with: { customer: true },
      orderBy: [desc(invoices.invoiceDate)],
    });

    const summaryRes = await this.db
      .select({
        count: count(invoices.id),
        grandTotal: sum(invoices.grandTotal),
        totalLabor: sum(invoices.totalLabor),
        totalParts: sum(invoices.totalParts),
        cgst: sum(invoices.cgst),
        sgst: sum(invoices.sgst),
        igst: sum(invoices.igst),
      })
      .from(invoices)
      .where(
        and(
          eq(invoices.workshopId, workshopId),
          gte(invoices.invoiceDate, startStr),
          lte(invoices.invoiceDate, endStr)
        )
      );

    const summary = summaryRes[0];

    return {
      summary: {
        totalCount: summary.count || 0,
        totalRevenue: parseFloat(summary.grandTotal || '0'),
        laborRevenue: parseFloat(summary.totalLabor || '0'),
        partsRevenue: parseFloat(summary.totalParts || '0'),
        taxCollected:
          parseFloat(summary.cgst || '0') +
          parseFloat(summary.sgst || '0') +
          parseFloat(summary.igst || '0'),
      },
      transactions: sales,
    };
  }

  async getGSTReport(workshopId: string, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    const startStr = startDate.toISOString();
    const endStr = endDate.toISOString();

    // Output Tax (Sales)
    const salesRes = await this.db
      .select({
        grandTotal: sum(invoices.grandTotal),
        totalLabor: sum(invoices.totalLabor),
        totalParts: sum(invoices.totalParts),
        cgst: sum(invoices.cgst),
        sgst: sum(invoices.sgst),
        igst: sum(invoices.igst),
      })
      .from(invoices)
      .where(
        and(
          eq(invoices.workshopId, workshopId),
          gte(invoices.invoiceDate, startStr),
          lte(invoices.invoiceDate, endStr)
        )
      );
    const sales = salesRes[0];

    // Input Tax (Purchases)
    const purchasesList = await this.db.query.purchases.findMany({
      where: and(
        eq(purchases.workshopId, workshopId),
        gte(purchases.invoiceDate, startStr),
        lte(purchases.invoiceDate, endStr),
        eq(purchases.status, 'RECEIVED')
      ),
      with: { purchaseItems: true }, // items
    });

    let totalInputTax = 0;
    let totalPurchaseValue = 0;

    purchasesList.forEach((po) => {
      totalPurchaseValue += po.totalAmount;
      po.purchaseItems.forEach((item) => {
        const rate = item.taxPercent || 18;
        const base = item.total / (1 + rate / 100);
        const tax = item.total - base;
        totalInputTax += tax;
      });
    });

    const cgstVal = parseFloat(sales.cgst || '0');
    const sgstVal = parseFloat(sales.sgst || '0');
    const igstVal = parseFloat(sales.igst || '0');
    const totalLaborVal = parseFloat(sales.totalLabor || '0');
    const totalPartsVal = parseFloat(sales.totalParts || '0');

    return {
      period: `${month}/${year}`,
      outputTax: {
        cgst: cgstVal,
        sgst: sgstVal,
        igst: igstVal,
        total: cgstVal + sgstVal + igstVal,
        taxableValue: totalLaborVal + totalPartsVal,
      },
      inputTax: {
        total: totalInputTax,
        purchaseValue: totalPurchaseValue,
      },
      netPayable: (cgstVal + sgstVal + igstVal) - totalInputTax,
    };
  }

  async getProfitLoss(workshopId: string, startDate: Date, endDate: Date) {
    const startStr = startDate.toISOString();
    const endStr = endDate.toISOString();

    // 1. Revenue (Invoices)
    const revenueRes = await this.db.select({ grandTotal: sum(invoices.grandTotal) })
      .from(invoices)
      .where(and(
        eq(invoices.workshopId, workshopId),
        gte(invoices.invoiceDate, startStr),
        lte(invoices.invoiceDate, endStr)
      ));
    const totalRevenue = parseFloat(revenueRes[0].grandTotal || '0');

    // 2. COGS (Parts Cost in Jobs)
    // JobPart -> jobCard -> Invoice date filter
    // This requires joining JobPart with JobCard and Invoice.
    // Drizzle select with inner joins.
    const jobPartsRes = await this.db.select({
      quantity: jobParts.quantity,
      purchasePrice: schema.inventoryBatches.purchasePrice // joined table column
    })
      .from(jobParts)
      .innerJoin(jobCards, eq(jobParts.jobCardId, jobCards.id))
      .innerJoin(invoices, eq(invoices.jobCardId, jobCards.id))
      .innerJoin(schema.inventoryBatches, eq(jobParts.batchId, schema.inventoryBatches.id))
      .where(and(
        eq(jobCards.workshopId, workshopId),
        gte(invoices.invoiceDate, startStr),
        lte(invoices.invoiceDate, endStr),
        isNotNull(jobParts.batchId)
      ));

    const cogs = jobPartsRes.reduce((sum, part) => {
      return sum + (part.quantity || 0) * (part.purchasePrice || 0);
    }, 0);

    // 3. Expenses (Overheads)
    const expensesRes = await this.db.select({ amount: sum(expenses.amount) })
      .from(expenses)
      .where(and(
        eq(expenses.workshopId, workshopId),
        gte(expenses.date, startStr),
        lte(expenses.date, endStr)
      ));
    const totalExpenses = parseFloat(expensesRes[0].amount || '0');

    const grossProfit = totalRevenue - cogs;
    const netProfit = grossProfit - totalExpenses;

    return {
      revenue: totalRevenue,
      cogs,
      grossProfit,
      expenses: totalExpenses,
      netProfit,
      marginPercent: totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0,
    };
  }
}
