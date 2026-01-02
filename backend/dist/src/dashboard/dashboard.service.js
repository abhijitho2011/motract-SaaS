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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let DashboardService = class DashboardService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getKPIs(workshopId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const vehiclesIn = await this.prisma.jobCard.count({
            where: {
                workshopId,
                entryTime: { gte: today },
            },
        });
        const jobsInProgress = await this.prisma.jobCard.count({
            where: {
                workshopId,
                stage: client_1.JobStage.WORK_IN_PROGRESS,
            },
        });
        const jobsCompleted = await this.prisma.jobCard.count({
            where: {
                workshopId,
                stage: client_1.JobStage.CLOSED,
                updatedAt: { gte: today },
            },
        });
        const pendingDeliveries = await this.prisma.jobCard.count({
            where: {
                workshopId,
                stage: client_1.JobStage.BILLING,
            },
        });
        const pendingApprovals = await this.prisma.jobCard.count({
            where: {
                workshopId,
                stage: client_1.JobStage.CUSTOMER_APPROVAL,
            },
        });
        const pendingPayments = await this.prisma.invoice.count({
            where: {
                workshopId,
                balance: { gt: 0 },
            },
        });
        const revenueResult = await this.prisma.invoice.aggregate({
            where: {
                workshopId,
                invoiceDate: { gte: today },
            },
            _sum: {
                grandTotal: true,
            },
        });
        const revenue = revenueResult._sum.grandTotal || 0;
        const lowStockItems = await this.prisma.inventoryItem.findMany({
            where: {
                workshopId,
                batches: {
                    some: {
                        quantity: { lte: 10 },
                    },
                },
            },
            select: {
                id: true,
                name: true,
                batches: {
                    select: {
                        quantity: true,
                    },
                },
            },
            take: 5,
        });
        return {
            vehiclesIn,
            jobsInProgress,
            jobsCompleted,
            pendingDeliveries,
            pendingApprovals,
            pendingPayments,
            revenue,
            lowStockCount: lowStockItems.length,
            lowStockItems,
            recentJobs: await this.prisma.jobCard.findMany({
                where: { workshopId },
                orderBy: { createdAt: 'desc' },
                take: 5,
                include: { vehicle: true, customer: true },
            }),
        };
    }
    async getJobStatusFunnel(workshopId) {
        const stages = Object.values(client_1.JobStage);
        const funnel = [];
        for (const stage of stages) {
            const count = await this.prisma.jobCard.count({
                where: { workshopId, stage },
            });
            funnel.push({ stage, count });
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
            const nextDate = new Date(date);
            nextDate.setDate(nextDate.getDate() + 1);
            const result = await this.prisma.invoice.aggregate({
                where: {
                    workshopId,
                    invoiceDate: {
                        gte: date,
                        lt: nextDate,
                    },
                },
                _sum: {
                    grandTotal: true,
                },
            });
            data.push({
                date: date.toISOString().split('T')[0],
                revenue: result._sum.grandTotal || 0,
            });
        }
        return data;
    }
    async getTopServices(workshopId, limit = 5) {
        const tasks = await this.prisma.jobItem.groupBy({
            by: ['description'],
            where: {
                jobCard: {
                    workshopId,
                },
            },
            _count: {
                description: true,
            },
            _sum: {
                price: true,
            },
            orderBy: {
                _count: {
                    description: 'desc',
                },
            },
            take: limit,
        });
        return tasks.map((task) => ({
            service: task.description,
            count: task._count.description,
            revenue: task._sum.price || 0,
        }));
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map