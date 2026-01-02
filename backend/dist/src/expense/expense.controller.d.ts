import { ExpenseService } from './expense.service';
import { Prisma } from '@prisma/client';
export declare class ExpenseController {
    private readonly expenseService;
    constructor(expenseService: ExpenseService);
    create(data: Prisma.ExpenseCreateInput): Promise<{
        id: string;
        category: string;
        workshopId: string;
        date: Date;
        amount: number;
        notes: string | null;
        attachmentUrl: string | null;
    }>;
    findAll(workshopId: string): Promise<{
        id: string;
        category: string;
        workshopId: string;
        date: Date;
        amount: number;
        notes: string | null;
        attachmentUrl: string | null;
    }[]>;
    remove(id: string): Promise<{
        id: string;
        category: string;
        workshopId: string;
        date: Date;
        amount: number;
        notes: string | null;
        attachmentUrl: string | null;
    }>;
}
