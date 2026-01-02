import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
    constructor(private prisma: PrismaService) { }

    async getSalesReport(workshopId: string, startDate: Date, endDate: Date) {
        // Aggregate Invoices
        const sales = await this.prisma.invoice.findMany({
            where: {
                workshopId,
                invoiceDate: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            include: { customer: true },
            orderBy: { invoiceDate: 'desc' },
        });

        const summary = await this.prisma.invoice.aggregate({
            where: {
                workshopId,
                invoiceDate: { gte: startDate, lte: endDate },
            },
            _sum: {
                grandTotal: true,
                totalLabor: true,
                totalParts: true,
                cgst: true,
                sgst: true,
                igst: true,
            },
            _count: { id: true },
        });

        return {
            summary: {
                totalCount: summary._count.id,
                totalRevenue: summary._sum.grandTotal || 0,
                laborRevenue: summary._sum.totalLabor || 0,
                partsRevenue: summary._sum.totalParts || 0,
                taxCollected: (summary._sum.cgst || 0) + (summary._sum.sgst || 0) + (summary._sum.igst || 0),
            },
            transactions: sales,
        };
    }

    async getGSTReport(workshopId: string, month: number, year: number) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        // Output Tax (Sales)
        const sales = await this.prisma.invoice.aggregate({
            where: {
                workshopId,
                invoiceDate: { gte: startDate, lte: endDate },
            },
            _sum: {
                grandTotal: true, // Tacable Value? No, this is total.
                totalLabor: true,
                totalParts: true,
                cgst: true,
                sgst: true,
                igst: true,
            },
        });

        // Input Tax (Purchases)
        // Need to sum purchase items tax
        // PurchaseOrder model has totalAmount, items have taxPercent. Schema says PurchaseItem has `total`, `taxPercent`, `unitCost`.
        // We lack explicit `taxAmount` on PurchaseItem in schema, but can calculate or if simplistic.
        // Actually, PurchaseOrder doesn't split tax in schema explicitly in aggregating fields.
        // Let's iterate purchases for now or aggregate if possible.
        // Better: PurchaseItem has total. Total usually includes tax? Or Base + Tax?
        // Schema: unitCost (Float), taxPercent (Float), total (Float).
        // Assuming total is tax inclusive or exclusive? Usually inclusive for "total".
        // Let's assume total is final.

        const purchases = await this.prisma.purchaseOrder.findMany({
            where: {
                workshopId,
                invoiceDate: { gte: startDate, lte: endDate },
                status: 'RECEIVED',
            },
            include: { items: true },
        });

        let totalInputTax = 0;
        let totalPurchaseValue = 0;

        purchases.forEach(po => {
            totalPurchaseValue += po.totalAmount;
            po.items.forEach(item => {
                // Back calculate tax if total = base * (1 + rate/100)
                // Tax = Total - (Total / (1 + rate/100))
                const rate = item.taxPercent || 18;
                const base = item.total / (1 + rate / 100);
                const tax = item.total - base;
                totalInputTax += tax;
            });
        });

        return {
            period: `${month}/${year}`,
            outputTax: {
                cgst: sales._sum.cgst || 0,
                sgst: sales._sum.sgst || 0,
                igst: sales._sum.igst || 0,
                total: (sales._sum.cgst || 0) + (sales._sum.sgst || 0) + (sales._sum.igst || 0),
                taxableValue: (sales._sum.totalLabor || 0) + (sales._sum.totalParts || 0),
            },
            inputTax: {
                total: totalInputTax,
                purchaseValue: totalPurchaseValue,
            },
            netPayable: ((sales._sum.cgst || 0) + (sales._sum.sgst || 0) + (sales._sum.igst || 0)) - totalInputTax,
        };
    }

    async getProfitLoss(workshopId: string, startDate: Date, endDate: Date) {
        // 1. Revenue (Invoices)
        const revenue = await this.prisma.invoice.aggregate({
            where: { workshopId, invoiceDate: { gte: startDate, lte: endDate } },
            _sum: { grandTotal: true },
        });

        // 2. COGS (Parts Cost in Jobs)
        // We need cost of parts used in Invoiced Jobs.
        // JobPart has unitPrice (Selling Price).
        // InventoryBatch has purchasePrice.
        // Linking JobPart to Batch to get cost is best.
        // JobPart has batchId.
        const jobParts = await this.prisma.jobPart.findMany({
            where: {
                jobCard: {
                    workshopId,
                    invoice: {
                        invoiceDate: { gte: startDate, lte: endDate }
                    }
                },
                batchId: { not: null }
            },
            include: { batch: true }
        });

        const cogs = jobParts.reduce((sum, part) => {
            return sum + (part.quantity * (part.batch?.purchasePrice || 0));
        }, 0);


        // 3. Expenses (Overheads)
        const expenses = await this.prisma.expense.aggregate({
            where: { workshopId, date: { gte: startDate, lte: endDate } },
            _sum: { amount: true },
        });

        const totalRevenue = revenue._sum.grandTotal || 0;
        const totalExpenses = expenses._sum.amount || 0;
        const grossProfit = totalRevenue - cogs;
        const netProfit = grossProfit - totalExpenses;

        return {
            revenue: totalRevenue,
            cogs,
            grossProfit,
            expenses: totalExpenses,
            netProfit,
            marginPercent: totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0
        };
    }
}
