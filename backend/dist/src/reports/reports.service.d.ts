import { PrismaService } from '../prisma/prisma.service';
export declare class ReportsService {
    private prisma;
    constructor(prisma: PrismaService);
    getSalesReport(workshopId: string, startDate: Date, endDate: Date): Promise<{
        summary: {
            totalCount: number;
            totalRevenue: number;
            laborRevenue: number;
            partsRevenue: number;
            taxCollected: number;
        };
        transactions: ({
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
        })[];
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
