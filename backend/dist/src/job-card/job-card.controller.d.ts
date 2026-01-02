import { JobCardService } from './job-card.service';
import type { JobStage, JobPriority } from '../drizzle/types';
export declare class JobCardController {
    private readonly jobCardService;
    constructor(jobCardService: JobCardService);
    create(body: {
        workshopId: string;
        vehicleId: string;
        customerName: string;
        customerMobile: string;
        advisorId?: string;
        odometer?: number;
        fuelLevel?: number;
        complaints?: string[];
        priority?: JobPriority;
    }): Promise<any>;
    findAll(workshopId: string): Promise<{
        id: string;
        createdAt: string;
        updatedAt: string;
        vehicleId: string;
        workshopId: string;
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
            variant: {
                id: string;
                name: string;
                fuelType: "PETROL" | "DIESEL" | "CNG" | "ELECTRIC" | "HYBRID";
                modelId: string;
                model: {
                    id: string;
                    name: string;
                    makeId: string;
                    make: {
                        id: string;
                        name: string;
                    };
                };
            };
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
    }[]>;
    findOne(id: string): Promise<any>;
    updateStage(id: string, stage: JobStage): Promise<{
        id: string;
        workshopId: string;
        vehicleId: string;
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
        createdAt: string;
        updatedAt: string;
    }[]>;
    saveInspection(id: string, body: {
        exterior: any;
        interior: any;
        tyres: any;
        battery?: string;
        documents?: any;
        photos: string[];
        fuelLevel?: number;
        odometer?: number;
    }): Promise<any>;
    addTask(id: string, body: {
        description: string;
        price: number;
        gst: number;
    }): Promise<{
        id: string;
        jobCardId: string;
        gstPercent: number;
        isApproved: boolean;
        description: string;
        price: number;
        completionStatus: string | null;
    }[]>;
    addPart(id: string, body: {
        itemId: string;
        quantity: number;
        unitPrice: number;
        gst: number;
    }): Promise<{
        item: any;
        id?: string | undefined;
        jobCardId?: string | undefined;
        itemId?: string | undefined;
        batchId?: string | null | undefined;
        quantity?: number | undefined;
        unitPrice?: number | undefined;
        gstPercent?: number | undefined;
        totalPrice?: number | undefined;
        isApproved?: boolean | undefined;
        inventoryItem?: {
            id: string;
            name: string;
            brand: string | null;
            createdAt: string;
            updatedAt: string;
            workshopId: string;
            isOem: boolean;
            hsnCode: string | null;
            taxPercent: number;
        } | undefined;
    }>;
    assignTechnician(id: string, body: {
        technicianId: string;
    }): Promise<{
        id: string;
        workshopId: string;
        vehicleId: string;
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
        createdAt: string;
        updatedAt: string;
    }[]>;
    updateTaskStatus(id: string, taskId: string, body: {
        status: string;
    }): Promise<{
        id: string;
        jobCardId: string;
        description: string;
        price: number;
        gstPercent: number;
        isApproved: boolean;
        completionStatus: string | null;
    }[]>;
}
