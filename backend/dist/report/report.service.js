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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_provider_1 = require("../drizzle/drizzle.provider");
const node_postgres_1 = require("drizzle-orm/node-postgres");
const schema_1 = require("../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
let ReportService = class ReportService {
    db;
    constructor(db) {
        this.db = db;
    }
    getMonthRange(monthFor) {
        const start = new Date(`${monthFor}-01T00:00:00.000Z`);
        const end = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59, 999);
        return {
            startStr: start.toISOString(),
            endStr: end.toISOString()
        };
    }
    async getGstr1(workshopId, month) {
        const { startStr, endStr } = this.getMonthRange(month);
        const sales = await this.db.query.invoices.findMany({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.invoices.workshopId, workshopId), (0, drizzle_orm_1.gte)(schema_1.invoices.invoiceDate, startStr), (0, drizzle_orm_1.lte)(schema_1.invoices.invoiceDate, endStr)),
            with: {
                customer: true,
            }
        });
        const b2b = [];
        const b2c = [];
        for (const inv of sales) {
            if (inv.customer?.gstin) {
                b2b.push(inv);
            }
            else {
                b2c.push(inv);
            }
        }
        return {
            period: month,
            b2bCount: b2b.length,
            b2cCount: b2c.length,
            b2bTotal: b2b.reduce((sum, i) => sum + i.grandTotal, 0),
            b2cTotal: b2c.reduce((sum, i) => sum + i.grandTotal, 0),
            b2bInvoices: b2b.map(i => ({ no: i.invoiceNumber, date: i.invoiceDate, customer: i.customer.name, gstin: i.customer.gstin, amt: i.grandTotal })),
        };
    }
    async getGstr3b(workshopId, month) {
        const { startStr, endStr } = this.getMonthRange(month);
        const pur = await this.db.query.purchases.findMany({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.purchases.workshopId, workshopId), (0, drizzle_orm_1.gte)(schema_1.purchases.invoiceDate, startStr), (0, drizzle_orm_1.lte)(schema_1.purchases.invoiceDate, endStr), (0, drizzle_orm_1.eq)(schema_1.purchases.status, 'RECEIVED')),
            with: { purchaseItems: true }
        });
        let totalItc = 0;
        for (const p of pur) {
            for (const item of p.purchaseItems) {
                const tax = (item.quantity * item.unitCost * (item.taxPercent / 100));
                totalItc += tax;
            }
        }
        const sales = await this.db.query.invoices.findMany({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.invoices.workshopId, workshopId), (0, drizzle_orm_1.gte)(schema_1.invoices.invoiceDate, startStr), (0, drizzle_orm_1.lte)(schema_1.invoices.invoiceDate, endStr))
        });
        const totalSales = sales.reduce((s, i) => s + i.grandTotal, 0);
        const approxOutwardTax = totalSales - (totalSales / 1.18);
        return {
            outwardTaxable: totalSales - approxOutwardTax,
            outwardTax: approxOutwardTax,
            itcAvailable: totalItc,
            netPayable: Math.max(0, approxOutwardTax - totalItc)
        };
    }
    async getPnL(workshopId, month) {
        const { startStr, endStr } = this.getMonthRange(month);
        const sales = await this.db.query.invoices.findMany({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.invoices.workshopId, workshopId), (0, drizzle_orm_1.gte)(schema_1.invoices.invoiceDate, startStr), (0, drizzle_orm_1.lte)(schema_1.invoices.invoiceDate, endStr))
        });
        const revenue = sales.reduce((s, i) => s + i.grandTotal, 0);
        const invoiceIds = sales.map(s => s.id);
        let cogs = 0;
        if (invoiceIds.length > 0) {
            const invs = await this.db.query.invoices.findMany({
                where: inArray(schema_1.invoices.id, invoiceIds),
                with: {
                    jobCard: {
                        with: {
                            jobParts: {
                                with: {
                                    inventoryBatch: true
                                }
                            }
                        }
                    }
                }
            });
            for (const inv of invs) {
                if (inv.jobCard && inv.jobCard.jobParts) {
                    for (const part of inv.jobCard.jobParts) {
                        const purchasePrice = part.inventoryBatch?.purchasePrice || 0;
                        cogs += (purchasePrice * part.quantity);
                    }
                }
            }
        }
        const exps = await this.db.query.expenses.findMany({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.expenses.workshopId, workshopId), (0, drizzle_orm_1.gte)(schema_1.expenses.date, startStr), (0, drizzle_orm_1.lte)(schema_1.expenses.date, endStr))
        });
        const totalExpenses = exps.reduce((s, e) => s + e.amount, 0);
        return {
            revenue,
            cogs,
            grossProfit: revenue - cogs,
            expenses: totalExpenses,
            netProfit: revenue - cogs - totalExpenses
        };
    }
};
exports.ReportService = ReportService;
exports.ReportService = ReportService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(drizzle_provider_1.DrizzleAsyncProvider)),
    __metadata("design:paramtypes", [node_postgres_1.NodePgDatabase])
], ReportService);
//# sourceMappingURL=report.service.js.map