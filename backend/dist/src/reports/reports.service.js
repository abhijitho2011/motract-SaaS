"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_provider_1 = require("../drizzle/drizzle.provider");
const node_postgres_1 = require("drizzle-orm/node-postgres");
const schema = __importStar(require("../drizzle/schema"));
const schema_1 = require("../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
let ReportsService = class ReportsService {
    db;
    constructor(db) {
        this.db = db;
    }
    async getSalesReport(workshopId, startDate, endDate) {
        const startStr = startDate.toISOString();
        const endStr = endDate.toISOString();
        const sales = await this.db.query.invoices.findMany({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.invoices.workshopId, workshopId), (0, drizzle_orm_1.gte)(schema_1.invoices.invoiceDate, startStr), (0, drizzle_orm_1.lte)(schema_1.invoices.invoiceDate, endStr)),
            with: { customer: true },
            orderBy: [(0, drizzle_orm_1.desc)(schema_1.invoices.invoiceDate)],
        });
        const summaryRes = await this.db
            .select({
            count: (0, drizzle_orm_1.count)(schema_1.invoices.id),
            grandTotal: (0, drizzle_orm_1.sum)(schema_1.invoices.grandTotal),
            totalLabor: (0, drizzle_orm_1.sum)(schema_1.invoices.totalLabor),
            totalParts: (0, drizzle_orm_1.sum)(schema_1.invoices.totalParts),
            cgst: (0, drizzle_orm_1.sum)(schema_1.invoices.cgst),
            sgst: (0, drizzle_orm_1.sum)(schema_1.invoices.sgst),
            igst: (0, drizzle_orm_1.sum)(schema_1.invoices.igst),
        })
            .from(schema_1.invoices)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.invoices.workshopId, workshopId), (0, drizzle_orm_1.gte)(schema_1.invoices.invoiceDate, startStr), (0, drizzle_orm_1.lte)(schema_1.invoices.invoiceDate, endStr)));
        const summary = summaryRes[0];
        return {
            summary: {
                totalCount: summary.count || 0,
                totalRevenue: parseFloat(summary.grandTotal || '0'),
                laborRevenue: parseFloat(summary.totalLabor || '0'),
                partsRevenue: parseFloat(summary.totalParts || '0'),
                taxCollected: parseFloat(summary.cgst || '0') +
                    parseFloat(summary.sgst || '0') +
                    parseFloat(summary.igst || '0'),
            },
            transactions: sales,
        };
    }
    async getGSTReport(workshopId, month, year) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);
        const startStr = startDate.toISOString();
        const endStr = endDate.toISOString();
        const salesRes = await this.db
            .select({
            grandTotal: (0, drizzle_orm_1.sum)(schema_1.invoices.grandTotal),
            totalLabor: (0, drizzle_orm_1.sum)(schema_1.invoices.totalLabor),
            totalParts: (0, drizzle_orm_1.sum)(schema_1.invoices.totalParts),
            cgst: (0, drizzle_orm_1.sum)(schema_1.invoices.cgst),
            sgst: (0, drizzle_orm_1.sum)(schema_1.invoices.sgst),
            igst: (0, drizzle_orm_1.sum)(schema_1.invoices.igst),
        })
            .from(schema_1.invoices)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.invoices.workshopId, workshopId), (0, drizzle_orm_1.gte)(schema_1.invoices.invoiceDate, startStr), (0, drizzle_orm_1.lte)(schema_1.invoices.invoiceDate, endStr)));
        const sales = salesRes[0];
        const purchasesList = await this.db.query.purchases.findMany({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.purchases.workshopId, workshopId), (0, drizzle_orm_1.gte)(schema_1.purchases.invoiceDate, startStr), (0, drizzle_orm_1.lte)(schema_1.purchases.invoiceDate, endStr), (0, drizzle_orm_1.eq)(schema_1.purchases.status, 'RECEIVED')),
            with: { purchaseItems: true },
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
    async getProfitLoss(workshopId, startDate, endDate) {
        const startStr = startDate.toISOString();
        const endStr = endDate.toISOString();
        const revenueRes = await this.db.select({ grandTotal: (0, drizzle_orm_1.sum)(schema_1.invoices.grandTotal) })
            .from(schema_1.invoices)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.invoices.workshopId, workshopId), (0, drizzle_orm_1.gte)(schema_1.invoices.invoiceDate, startStr), (0, drizzle_orm_1.lte)(schema_1.invoices.invoiceDate, endStr)));
        const totalRevenue = parseFloat(revenueRes[0].grandTotal || '0');
        const jobPartsRes = await this.db.select({
            quantity: schema_1.jobParts.quantity,
            purchasePrice: schema.inventoryBatches.purchasePrice
        })
            .from(schema_1.jobParts)
            .innerJoin(schema_1.jobCards, (0, drizzle_orm_1.eq)(schema_1.jobParts.jobCardId, schema_1.jobCards.id))
            .innerJoin(schema_1.invoices, (0, drizzle_orm_1.eq)(schema_1.invoices.jobCardId, schema_1.jobCards.id))
            .innerJoin(schema.inventoryBatches, (0, drizzle_orm_1.eq)(schema_1.jobParts.batchId, schema.inventoryBatches.id))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.jobCards.workshopId, workshopId), (0, drizzle_orm_1.gte)(schema_1.invoices.invoiceDate, startStr), (0, drizzle_orm_1.lte)(schema_1.invoices.invoiceDate, endStr), (0, drizzle_orm_1.isNotNull)(schema_1.jobParts.batchId)));
        const cogs = jobPartsRes.reduce((sum, part) => {
            return sum + (part.quantity || 0) * (part.purchasePrice || 0);
        }, 0);
        const expensesRes = await this.db.select({ amount: (0, drizzle_orm_1.sum)(schema_1.expenses.amount) })
            .from(schema_1.expenses)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.expenses.workshopId, workshopId), (0, drizzle_orm_1.gte)(schema_1.expenses.date, startStr), (0, drizzle_orm_1.lte)(schema_1.expenses.date, endStr)));
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
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(drizzle_provider_1.DrizzleAsyncProvider)),
    __metadata("design:paramtypes", [node_postgres_1.NodePgDatabase])
], ReportsService);
//# sourceMappingURL=reports.service.js.map