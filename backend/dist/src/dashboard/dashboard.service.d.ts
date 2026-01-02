import { PrismaService } from '../prisma/prisma.service';
export declare class DashboardService {
    private prisma;
    constructor(prisma: PrismaService);
    getKPIs(workshopId: string): Promise<{
        vehiclesIn: number;
        jobsInProgress: number;
        jobsCompleted: number;
        pendingDeliveries: number;
        pendingApprovals: number;
        pendingPayments: number;
        revenue: number;
        lowStockCount: number;
        lowStockItems: {
            id: string;
            name: string;
            batches: {
                quantity: number;
            }[];
        }[];
    }>;
    getJobStatusFunnel(workshopId: string): Promise<{
        stage: "CREATED" | "INSPECTION" | "ESTIMATE" | "CUSTOMER_APPROVAL" | "WORK_IN_PROGRESS" | "QC" | "BILLING" | "DELIVERY" | "CLOSED";
        count: number;
    }[]>;
    getRevenueGraph(workshopId: string, days?: number): Promise<{
        date: string;
        revenue: number;
    }[]>;
    getTopServices(workshopId: string, limit?: number): Promise<{
        service: string;
        count: number;
        revenue: number;
    }[]>;
}
