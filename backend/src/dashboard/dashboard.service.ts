import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JobStage } from '@prisma/client';

@Injectable()
export class DashboardService {
    constructor(private prisma: PrismaService) { }

    async getKPIs(workshopId: string) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Vehicles In (today)
        const vehiclesIn = await this.prisma.jobCard.count({
            where: {
                workshopId,
                entryTime: { gte: today },
            },
        });

        // Jobs In Progress
        const jobsInProgress = await this.prisma.jobCard.count({
            where: {
                workshopId,
                stage: JobStage.WORK_IN_PROGRESS,
            },
        });

        // Jobs Completed (today)
        const jobsCompleted = await this.prisma.jobCard.count({
            where: {
                workshopId,
                stage: JobStage.CLOSED,
                updatedAt: { gte: today },
            },
        });

        // Pending Deliveries
        const pendingDeliveries = await this.prisma.jobCard.count({
            where: {
                workshopId,
                stage: JobStage.BILLING,
            },
        });

        // Pending Approvals
        const pendingApprovals = await this.prisma.jobCard.count({
            where: {
                workshopId,
                stage: JobStage.CUSTOMER_APPROVAL,
            },
        });

        // Pending Payments (invoices with balance)
        const pendingPayments = await this.prisma.invoice.count({
            where: {
                workshopId,
                balance: { gt: 0 },
            },
        });

        // Revenue (today)
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

        // Low Stock Items
        const lowStockItems = await this.prisma.inventoryItem.findMany({
            where: {
                workshopId,
                batches: {
                    some: {
                        quantity: { lte: 10 }, // Reorder level threshold
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

    async getJobStatusFunnel(workshopId: string) {
        const stages = Object.values(JobStage);
        const funnel = [];

        for (const stage of stages) {
            const count = await this.prisma.jobCard.count({
                where: { workshopId, stage },
            });
            funnel.push({ stage, count });
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

    async getTopServices(workshopId: string, limit: number = 5) {
        // Aggregate task descriptions from job items
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
}
