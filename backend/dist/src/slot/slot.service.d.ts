import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../drizzle/schema';
import { slotBookings } from '../drizzle/schema';
import { BayType } from '../drizzle/types';
export declare class SlotService {
    private db;
    constructor(db: NodePgDatabase<typeof schema>);
    createBay(data: {
        workshopId: string;
        name: string;
        type: BayType;
    }): Promise<{
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
    }[]>;
    generateSlots(bayId: string, date: Date, startStr: string, endStr: string, durationMin: number): Promise<never[]>;
    getSlots(bayId: string, date: Date): Promise<{
        id: string;
        bayId: string;
        date: string;
        startTime: string;
        endTime: string;
        status: "AVAILABLE" | "BOOKED" | "BLOCKED";
        jobCardId: string | null;
        createdAt: string;
    }[]>;
    bookSlot(data: typeof slotBookings.$inferInsert): Promise<{
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
