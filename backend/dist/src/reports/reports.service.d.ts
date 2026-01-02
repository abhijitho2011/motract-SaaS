import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../drizzle/schema';
export declare class ReportsService {
    private db;
    constructor(db: NodePgDatabase<typeof schema>);
    getSalesReport(workshopId: string, startDate: Date, endDate: Date): Promise<{
        summary: {
            totalCount: number;
            totalRevenue: number;
            laborRevenue: number;
            partsRevenue: number;
            taxCollected: number;
        };
        transactions: {
            id: string;
            workshopId: string;
            customerId: string;
            jobCardId: string | null;
            invoiceDate: string;
            invoiceNumber: string;
            type: "JOB_CARD" | "COUNTER_SALE";
            totalLabor: number;
            totalParts: number;
            cgst: number;
            sgst: number;
            igst: number;
            discount: number;
            grandTotal: number;
            paidAmount: number;
            balance: number;
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
    getGSTReport(workshopId: string, month: number, year: number): Promise<{
        period: string;
        outputTax: {
            cgst: number;
            sgst: number;
            igst: number;
            total: number;
            taxableValue: number;
        };
        inputTax: {
            total: number;
            purchaseValue: number;
        };
        netPayable: number;
    }>;
    getProfitLoss(workshopId: string, startDate: Date, endDate: Date): Promise<{
        revenue: number;
        cogs: number;
        grossProfit: number;
        expenses: number;
        netProfit: number;
        marginPercent: number;
    }>;
}
