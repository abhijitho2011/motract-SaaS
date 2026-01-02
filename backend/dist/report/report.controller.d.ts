import { ReportService } from './report.service';
export declare class ReportController {
    private readonly reportService;
    constructor(reportService: ReportService);
    getGstr1(workshopId: string, month: string): Promise<{
        period: string;
        b2bCount: number;
        b2cCount: number;
        b2bTotal: number;
        b2cTotal: number;
        b2bInvoices: {
            no: string;
            date: string;
            customer: string;
            gstin: string | null;
            amt: number;
        }[];
    }>;
    getGstr3b(workshopId: string, month: string): Promise<{
        outwardTaxable: number;
        outwardTax: number;
        itcAvailable: number;
        netPayable: number;
    }>;
    getPnL(workshopId: string, month: string): Promise<{
        revenue: number;
        cogs: number;
        grossProfit: number;
        expenses: number;
        netProfit: number;
    }>;
}
