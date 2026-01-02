import { PrismaService } from '../prisma/prisma.service';
import { Prisma, JobStage, JobPriority } from '@prisma/client';
export declare class JobCardService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: {
        workshopId: string;
        vehicleId: string;
        customerName: string;
        customerMobile: string;
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
                fuelType: import(".prisma/client").$Enums.FuelType;
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
                fuelType: import(".prisma/client").$Enums.FuelType;
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
            exterior: Prisma.JsonValue | null;
            interior: Prisma.JsonValue | null;
            tyres: Prisma.JsonValue | null;
            battery: string | null;
            documents: Prisma.JsonValue | null;
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
            quantity: number;
            unitPrice: number;
            totalPrice: number;
            itemId: string;
            batchId: string | null;
        })[];
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
    }>;
    updateStage(id: string, stage: JobStage): Promise<{
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
    }>;
    saveInspection(jobCardId: string, data: {
        exterior: any;
        interior: any;
        tyres: any;
        battery?: string;
        documents?: any;
        photos: string[];
        fuelLevel?: number;
        odometer?: number;
    }): Promise<{
        id: string;
        jobCardId: string;
        exterior: Prisma.JsonValue | null;
        interior: Prisma.JsonValue | null;
        tyres: Prisma.JsonValue | null;
        battery: string | null;
        documents: Prisma.JsonValue | null;
        photos: string[];
    }>;
    addTask(jobCardId: string, data: {
        description: string;
        price: number;
        gst: number;
    }): Promise<{
        id: string;
        jobCardId: string;
        description: string;
        price: number;
        gstPercent: number;
        isApproved: boolean;
        completionStatus: string | null;
    }>;
    addPart(jobCardId: string, data: {
        itemId: string;
        quantity: number;
        unitPrice: number;
        gst: number;
    }): Promise<{
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
        quantity: number;
        unitPrice: number;
        totalPrice: number;
        itemId: string;
        batchId: string | null;
    }>;
    assignTechnician(id: string, technicianId: string): Promise<{
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
    }>;
    updateTaskStatus(jobCardId: string, taskId: string, status: string): Promise<{
        id: string;
        jobCardId: string;
        description: string;
        price: number;
        gstPercent: number;
        isApproved: boolean;
        completionStatus: string | null;
    }>;
}
