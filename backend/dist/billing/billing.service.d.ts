import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../drizzle/schema';
export declare class BillingService {
    private db;
    constructor(db: NodePgDatabase<typeof schema>);
    generateInvoice(jobCardId: string): Promise<{
        id: string;
        type: "JOB_CARD" | "COUNTER_SALE";
        workshopId: string;
        customerId: string;
        jobCardId: string | null;
        invoiceDate: string;
        invoiceNumber: string;
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
    getInvoice(id: string): Promise<any>;
}
