import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../drizzle/schema';
export declare class SlotService {
    private db;
    constructor(db: NodePgDatabase<typeof schema>);
    createBay(data: any): Promise<{
        id: string;
        name: string;
        workshopId: string;
        isActive: boolean;
        type: "SERVICE" | "WASHING" | "ALIGNMENT" | "ELECTRICAL" | "GENERAL";
    }>;
    findBays(workshopId: string): Promise<{
        id: string;
        name: string;
        workshopId: string;
        isActive: boolean;
        type: "SERVICE" | "WASHING" | "ALIGNMENT" | "ELECTRICAL" | "GENERAL";
        slotBookings: {
            date: string;
            id: string;
            createdAt: string;
            jobCardId: string | null;
            status: "AVAILABLE" | "BOOKED" | "BLOCKED";
            startTime: string;
            endTime: string;
            bayId: string;
        }[];
    }[]>;
    bookSlot(data: any): Promise<{
        date: string;
        id: string;
        createdAt: string;
        jobCardId: string | null;
        status: "AVAILABLE" | "BOOKED" | "BLOCKED";
        startTime: string;
        endTime: string;
        bayId: string;
    }>;
}
