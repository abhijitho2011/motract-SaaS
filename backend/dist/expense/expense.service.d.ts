import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../drizzle/schema';
import { expenses } from '../drizzle/schema';
export declare class ExpenseService {
    private db;
    constructor(db: NodePgDatabase<typeof schema>);
    createExpense(data: typeof expenses.$inferInsert): Promise<{
        date: string;
        id: string;
        workshopId: string;
        notes: string | null;
        amount: number;
        category: string;
        attachmentUrl: string | null;
    }>;
    getExpenses(workshopId: string): Promise<{
        date: string;
        id: string;
        workshopId: string;
        notes: string | null;
        amount: number;
        category: string;
        attachmentUrl: string | null;
    }[]>;
    deleteExpense(id: string): Promise<{
        date: string;
        id: string;
        workshopId: string;
        notes: string | null;
        amount: number;
        category: string;
        attachmentUrl: string | null;
    }[]>;
}
