import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getKPIs(req: any, queryWorkshopId?: string): Promise<{
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
        recentJobs: {
            id: string;
            createdAt: string;
            updatedAt: string;
            vehicleId: string;
            workshopId: string;
            jobCardNumber: string | null;
            customerId: string;
            stage: "CREATED" | "INSPECTION" | "ESTIMATE" | "CUSTOMER_APPROVAL" | "WORK_IN_PROGRESS" | "QC" | "BILLING" | "DELIVERY" | "CLOSED";
            priority: "NORMAL" | "URGENT";
            odometer: number | null;
            fuelLevel: number | null;
            entryTime: string;
            estimatedDeliveryTime: string | null;
            actualDeliveryTime: string | null;
            advisorId: string | null;
            technicianId: string | null;
            vehicle: {
                id: string;
                regNumber: string;
                chassisNumber: string | null;
                engineNumber: string | null;
                vin: string | null;
                mfgYear: number | null;
                variantId: string;
                createdAt: string;
                updatedAt: string;
            };
            customer: {
                id: string;
                name: string;
                createdAt: string;
                updatedAt: string;
                email: string | null;
                mobile: string;
                workshopId: string;
                address: string | null;
                gstin: string | null;
            };
        }[];
    }>;
    getJobStatusFunnel(req: any, queryWorkshopId?: string): Promise<{
        stage: import("../drizzle/types").JobStage;
        count: number;
    }[]>;
    getRevenueGraph(req: any, queryWorkshopId?: string, days?: string): Promise<{
        date: string;
        revenue: number;
    }[]>;
    getTopServices(req: any, queryWorkshopId?: string, limit?: string): Promise<{
        service: string;
        count: number;
        revenue: number;
    }[]>;
}
