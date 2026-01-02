import { BillingService } from './billing.service';
export declare class BillingController {
    private readonly billingService;
    constructor(billingService: BillingService);
    generateInvoice(jobCardId: string): Promise<{
        id: string;
        workshopId: string;
        customerId: string;
        jobCardId: string | null;
        invoiceNumber: string;
        invoiceDate: Date;
        type: import(".prisma/client").$Enums.InvoiceType;
        totalLabor: number;
        totalParts: number;
        cgst: number;
        sgst: number;
        igst: number;
        discount: number;
        grandTotal: number;
        paidAmount: number;
        balance: number;
    }>;
    getInvoice(id: string): Promise<({
        workshop: {
            id: string;
            name: string;
            email: string | null;
            mobile: string;
            createdAt: Date;
            updatedAt: Date;
            address: string | null;
            gstin: string | null;
            city: string | null;
            state: string | null;
            pincode: string | null;
            logoUrl: string | null;
            isActive: boolean;
            latitude: number | null;
            longitude: number | null;
            workingStartHour: string;
            workingEndHour: string;
            slotDurationMin: number;
            workingDays: string[];
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
        jobCard: ({
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
        }) | null;
    } & {
        id: string;
        workshopId: string;
        customerId: string;
        jobCardId: string | null;
        invoiceNumber: string;
        invoiceDate: Date;
        type: import(".prisma/client").$Enums.InvoiceType;
        totalLabor: number;
        totalParts: number;
        cgst: number;
        sgst: number;
        igst: number;
        discount: number;
        grandTotal: number;
        paidAmount: number;
        balance: number;
    }) | null>;
}
