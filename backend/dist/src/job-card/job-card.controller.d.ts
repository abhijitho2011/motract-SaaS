import { JobCardService } from './job-card.service';
import { JobStage, JobPriority } from '@prisma/client';
export declare class JobCardController {
    private readonly jobCardService;
    constructor(jobCardService: JobCardService);
    create(body: {
        workshopId: string;
        vehicleRegNumber: string;
        customerId: string;
        advisorId?: string;
        odometer?: number;
        fuelLevel?: number;
        complaints?: string[];
        priority?: JobPriority;
    }): Promise<{
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
        complaints: {
            id: string;
            complaint: string;
            remark: string | null;
            jobCardId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        workshopId: string;
        stage: import("@prisma/client").$Enums.JobStage;
        priority: import("@prisma/client").$Enums.JobPriority;
        odometer: number | null;
        fuelLevel: number | null;
        entryTime: Date;
        estimatedDeliveryTime: Date | null;
        actualDeliveryTime: Date | null;
        advisorId: string | null;
        technicianId: string | null;
        vehicleId: string;
        customerId: string;
    }>;
    findAll(workshopId: string): Promise<({
        vehicle: {
            variant: {
                model: {
                    make: {
                        id: string;
                        name: string;
                    };
                } & {
                    id: string;
                    name: string;
                    makeId: string;
                };
            } & {
                id: string;
                name: string;
                fuelType: import("@prisma/client").$Enums.FuelType;
                modelId: string;
            };
        } & {
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
        stage: import("@prisma/client").$Enums.JobStage;
        priority: import("@prisma/client").$Enums.JobPriority;
        odometer: number | null;
        fuelLevel: number | null;
        entryTime: Date;
        estimatedDeliveryTime: Date | null;
        actualDeliveryTime: Date | null;
        advisorId: string | null;
        technicianId: string | null;
        vehicleId: string;
        customerId: string;
    })[]>;
    findOne(id: string): Promise<{
        vehicle: {
            variant: {
                model: {
                    make: {
                        id: string;
                        name: string;
                    };
                } & {
                    id: string;
                    name: string;
                    makeId: string;
                };
            } & {
                id: string;
                name: string;
                fuelType: import("@prisma/client").$Enums.FuelType;
                modelId: string;
            };
        } & {
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
        complaints: {
            id: string;
            complaint: string;
            remark: string | null;
            jobCardId: string;
        }[];
        inspection: {
            id: string;
            jobCardId: string;
            exterior: import("@prisma/client/runtime/client").JsonValue | null;
            interior: import("@prisma/client/runtime/client").JsonValue | null;
            tyres: import("@prisma/client/runtime/client").JsonValue | null;
            battery: string | null;
            documents: import("@prisma/client/runtime/client").JsonValue | null;
            photos: string[];
        } | null;
        tasks: {
            id: string;
            jobCardId: string;
            description: string;
            price: number;
            gstPercent: number;
            isApproved: boolean;
            completionStatus: string | null;
        }[];
        parts: ({
            item: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                workshopId: string;
                brand: string | null;
                isOem: boolean;
                hsnCode: string | null;
                taxPercent: number;
            };
        } & {
            id: string;
            jobCardId: string;
            gstPercent: number;
            isApproved: boolean;
            itemId: string;
            batchId: string | null;
            quantity: number;
            unitPrice: number;
            totalPrice: number;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        workshopId: string;
        stage: import("@prisma/client").$Enums.JobStage;
        priority: import("@prisma/client").$Enums.JobPriority;
        odometer: number | null;
        fuelLevel: number | null;
        entryTime: Date;
        estimatedDeliveryTime: Date | null;
        actualDeliveryTime: Date | null;
        advisorId: string | null;
        technicianId: string | null;
        vehicleId: string;
        customerId: string;
    }>;
    updateStage(id: string, stage: JobStage): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        workshopId: string;
        stage: import("@prisma/client").$Enums.JobStage;
        priority: import("@prisma/client").$Enums.JobPriority;
        odometer: number | null;
        fuelLevel: number | null;
        entryTime: Date;
        estimatedDeliveryTime: Date | null;
        actualDeliveryTime: Date | null;
        advisorId: string | null;
        technicianId: string | null;
        vehicleId: string;
        customerId: string;
    }>;
}
