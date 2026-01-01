import { BillingService } from './billing.service';
export declare class BillingController {
    private readonly billingService;
    constructor(billingService: BillingService);
    createJobCardInvoice(jobCardId: string): Promise<{
        id: string;
        workshopId: string;
        customerId: string;
        jobCardId: string | null;
        invoiceNumber: string;
        invoiceDate: Date;
        type: import("@prisma/client").$Enums.InvoiceType;
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
}
