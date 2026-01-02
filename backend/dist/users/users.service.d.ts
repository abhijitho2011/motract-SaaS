import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../drizzle/schema';
import { users } from '../drizzle/schema';
export declare class UsersService {
    private db;
    constructor(db: NodePgDatabase<typeof schema>);
    create(data: typeof users.$inferInsert): Promise<{
        id: string;
        name: string | null;
        createdAt: string;
        updatedAt: string;
        email: string | null;
        mobile: string;
        password: string | null;
        role: "SUPER_ADMIN" | "WORKSHOP_ADMIN" | "WORKSHOP_MANAGER" | "TECHNICIAN" | "CLIENT" | "RSA_PROVIDER" | "SUPPLIER";
        workshopId: string | null;
    }>;
    findOne(mobile: string): Promise<{
        id: string;
        email: string | null;
        mobile: string;
        password: string | null;
        role: "SUPER_ADMIN" | "WORKSHOP_ADMIN" | "WORKSHOP_MANAGER" | "TECHNICIAN" | "CLIENT" | "RSA_PROVIDER" | "SUPPLIER";
        name: string | null;
        createdAt: string;
        updatedAt: string;
        workshopId: string | null;
    }>;
}
