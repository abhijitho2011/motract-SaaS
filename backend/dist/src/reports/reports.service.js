"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ReportsService = class ReportsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSalesReport(workshopId, startDate, endDate) {
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
    async getGSTReport(workshopId, month, year) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);
        const sales = await this.prisma.invoice.aggregate({
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
        });
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
    async getProfitLoss(workshopId, startDate, endDate) {
        const revenue = await this.prisma.invoice.aggregate({
            where: { workshopId, invoiceDate: { gte: startDate, lte: endDate } },
            _sum: { grandTotal: true },
        });
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
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map