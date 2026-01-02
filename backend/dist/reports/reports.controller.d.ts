import { ReportsService } from './reports.service';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    getSales(req: any, startDate: string, endDate: string): Promise<{
        summary: {
            totalCount: number;
            totalRevenue: number;
            laborRevenue: number;
            partsRevenue: number;
            taxCollected: number;
        };
        transactions: {
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
    getGST(req: any, month: string, year: string): Promise<{
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
    getPnL(req: any, startDate: string, endDate: string): Promise<{
        revenue: number;
        cogs: number;
        grossProfit: number;
        expenses: number;
        netProfit: number;
        marginPercent: number;
    }>;
}
