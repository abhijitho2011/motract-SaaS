import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
export declare class ExpenseService {
    private prisma;
    constructor(prisma: PrismaService);
    createExpense(data: Prisma.ExpenseCreateInput): Promise<{
        id: string;
        category: string;
        workshopId: string;
        date: Date;
        amount: number;
        notes: string | null;
        attachmentUrl: string | null;
    }>;
    getExpenses(workshopId: string): Promise<{
        id: string;
        category: string;
        workshopId: string;
        date: Date;
        amount: number;
        notes: string | null;
        attachmentUrl: string | null;
    }[]>;
    deleteExpense(id: string): Promise<{
        id: string;
        category: string;
        workshopId: string;
        date: Date;
        amount: number;
        notes: string | null;
        attachmentUrl: string | null;
    }>;
}
