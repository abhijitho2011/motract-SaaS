import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { users } from '../drizzle/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../drizzle/schema';
export declare class AuthService {
    private usersService;
    private jwtService;
    private db;
    constructor(usersService: UsersService, jwtService: JwtService, db: NodePgDatabase<typeof schema>);
    validateUser(mobile: string, pass: string): Promise<any>;
    login(user: any): Promise<{
        access_token: string;
        user: any;
    }>;
    register(data: typeof users.$inferInsert): Promise<{
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
}
