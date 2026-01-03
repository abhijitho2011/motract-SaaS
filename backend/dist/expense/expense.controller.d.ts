import { ExpenseService } from './expense.service';
export declare class ExpenseController {
    private readonly expenseService;
    constructor(expenseService: ExpenseService);
    create(data: any): Promise<{
        date: string;
        id: string;
        workshopId: string;
        notes: string | null;
        amount: number;
        category: string;
        attachmentUrl: string | null;
    }>;
    findAll(workshopId: string): Promise<{
        date: string;
        id: string;
        workshopId: string;
        notes: string | null;
        amount: number;
        category: string;
        attachmentUrl: string | null;
    }[]>;
    remove(id: string): Promise<{
        date: string;
        id: string;
        workshopId: string;
        notes: string | null;
        amount: number;
        category: string;
        attachmentUrl: string | null;
    }[]>;
}
