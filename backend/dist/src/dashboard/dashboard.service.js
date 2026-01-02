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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_provider_1 = require("../drizzle/drizzle.provider");
const node_postgres_1 = require("drizzle-orm/node-postgres");
const schema_1 = require("../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
const JOB_STAGES = [
    'CREATED', 'INSPECTION', 'ESTIMATE', 'CUSTOMER_APPROVAL',
    'WORK_IN_PROGRESS', 'QC', 'BILLING', 'DELIVERY', 'CLOSED'
];
let DashboardService = class DashboardService {
    db;
    constructor(db) {
        this.db = db;
    }
    async getKPIs(workshopId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toISOString();
        const vehiclesIn = await this.db.select({ count: (0, drizzle_orm_1.count)() }).from(schema_1.jobCards)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.jobCards.workshopId, workshopId), (0, drizzle_orm_1.gte)(schema_1.jobCards.entryTime, todayStr)));
        const jobsInProgress = await this.db.select({ count: (0, drizzle_orm_1.count)() }).from(schema_1.jobCards)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.jobCards.workshopId, workshopId), (0, drizzle_orm_1.eq)(schema_1.jobCards.stage, 'WORK_IN_PROGRESS')));
        const jobsCompleted = await this.db.select({ count: (0, drizzle_orm_1.count)() }).from(schema_1.jobCards)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.jobCards.workshopId, workshopId), (0, drizzle_orm_1.eq)(schema_1.jobCards.stage, 'CLOSED'), (0, drizzle_orm_1.gte)(schema_1.jobCards.updatedAt, todayStr)));
        const pendingDeliveries = await this.db.select({ count: (0, drizzle_orm_1.count)() }).from(schema_1.jobCards)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.jobCards.workshopId, workshopId), (0, drizzle_orm_1.eq)(schema_1.jobCards.stage, 'BILLING')));
        const pendingApprovals = await this.db.select({ count: (0, drizzle_orm_1.count)() }).from(schema_1.jobCards)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.jobCards.workshopId, workshopId), (0, drizzle_orm_1.eq)(schema_1.jobCards.stage, 'CUSTOMER_APPROVAL')));
        const pendingPayments = await this.db.select({ count: (0, drizzle_orm_1.count)() }).from(schema_1.invoices)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.invoices.workshopId, workshopId), (0, drizzle_orm_1.gt)(schema_1.invoices.balance, 0)));
        const revenueResult = await this.db.select({ sum: (0, drizzle_orm_1.sum)(schema_1.invoices.grandTotal) }).from(schema_1.invoices)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.invoices.workshopId, workshopId), (0, drizzle_orm_1.gte)(schema_1.invoices.invoiceDate, todayStr)));
        const revenue = parseFloat(revenueResult[0].sum || '0');
        const allItems = await this.db.query.inventoryItems.findMany({
            where: (0, drizzle_orm_1.eq)(schema_1.inventoryItems.workshopId, workshopId),
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
                where: (0, drizzle_orm_1.eq)(schema_1.jobCards.workshopId, workshopId),
                orderBy: [(0, drizzle_orm_1.desc)(schema_1.jobCards.createdAt)],
                limit: 5,
                with: { vehicle: true, customer: true },
            }),
        };
    }
    async getJobStatusFunnel(workshopId) {
        const stages = JOB_STAGES;
        const funnel = [];
        for (const stage of stages) {
            const countRes = await this.db.select({ count: (0, drizzle_orm_1.count)() }).from(schema_1.jobCards)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.jobCards.workshopId, workshopId), (0, drizzle_orm_1.eq)(schema_1.jobCards.stage, stage)));
            funnel.push({ stage, count: countRes[0].count });
        }
        return funnel;
    }
    async getRevenueGraph(workshopId, days = 7) {
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
            const result = await this.db.select({ sum: (0, drizzle_orm_1.sum)(schema_1.invoices.grandTotal) }).from(schema_1.invoices)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.invoices.workshopId, workshopId), (0, drizzle_orm_1.gte)(schema_1.invoices.invoiceDate, dateStr), (0, drizzle_orm_1.sql) `${schema_1.invoices.invoiceDate} < ${nextDateStr}`));
            data.push({
                date: date.toISOString().split('T')[0],
                revenue: parseFloat(result[0].sum || '0'),
            });
        }
        return data;
    }
    async getTopServices(workshopId, limit = 5) {
        const tasks = await this.db.select({
            description: schema_1.jobItems.description,
            count: (0, drizzle_orm_1.count)(schema_1.jobItems.description),
            revenue: (0, drizzle_orm_1.sum)(schema_1.jobItems.price)
        })
            .from(schema_1.jobItems)
            .innerJoin(schema_1.jobCards, (0, drizzle_orm_1.eq)(schema_1.jobItems.jobCardId, schema_1.jobCards.id))
            .where((0, drizzle_orm_1.eq)(schema_1.jobCards.workshopId, workshopId))
            .groupBy(schema_1.jobItems.description)
            .orderBy((0, drizzle_orm_1.desc)((0, drizzle_orm_1.count)(schema_1.jobItems.description)))
            .limit(limit);
        return tasks.map((task) => ({
            service: task.description,
            count: task.count,
            revenue: parseFloat(task.revenue || '0'),
        }));
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(drizzle_provider_1.DrizzleAsyncProvider)),
    __metadata("design:paramtypes", [node_postgres_1.NodePgDatabase])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map