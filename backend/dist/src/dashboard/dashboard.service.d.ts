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
        recentJobs: ({
            vehicle: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                regNumber: string;
                chassisNumber: string | null;
                engineNumber: string | null;
                vin: string | null;
                mfgYear: number | null;
                variantId: string;
            };
            customer: {
                id: string;
                name: string;
                email: string | null;
                mobile: string;
                createdAt: Date;
                updatedAt: Date;
                workshopId: string;
                address: string | null;
                gstin: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            workshopId: string;
            stage: import(".prisma/client").$Enums.JobStage;
            priority: import(".prisma/client").$Enums.JobPriority;
            odometer: number | null;
            fuelLevel: number | null;
            entryTime: Date;
            estimatedDeliveryTime: Date | null;
            actualDeliveryTime: Date | null;
            advisorId: string | null;
            technicianId: string | null;
            vehicleId: string;
            customerId: string;
        })[];
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
