import { ExpenseService } from './expense.service';
export declare class ExpenseController {
    private readonly expenseService;
    constructor(expenseService: ExpenseService);
    create(req: any, data: any): Promise<{
        date: string;
        id: string;
        workshopId: string;
        notes: string | null;
        amount: number;
        category: string;
        attachmentUrl: string | null;
    }>;
    findAll(req: any): Promise<{
        date: string;
        id: string;
        workshopId: string;
        notes: string | null;
        amount: number;
        category: string;
        attachmentUrl: string | null;
    }[]>;
    remove(req: any, id: string): Promise<{
        date: string;
        id: string;
        workshopId: string;
        notes: string | null;
        amount: number;
        category: string;
        attachmentUrl: string | null;
    }>;
}
