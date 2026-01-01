import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
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
    getRevenueGraph(workshopId: string, days?: string): Promise<{
        date: string;
        revenue: number;
    }[]>;
    getTopServices(workshopId: string, limit?: string): Promise<{
        service: string;
        count: number;
        revenue: number;
    }[]>;
}
