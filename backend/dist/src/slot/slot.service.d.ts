import { PrismaService } from '../prisma/prisma.service';
import { BayType } from '@prisma/client';
export declare class SlotService {
    private prisma;
    constructor(prisma: PrismaService);
    createBay(data: {
        workshopId: string;
        name: string;
        type: BayType;
    }): Promise<{
        id: string;
        name: string;
        workshopId: string;
        type: import(".prisma/client").$Enums.BayType;
        isActive: boolean;
    }>;
    findBays(workshopId: string): Promise<({
        services: {
            id: string;
            bayId: string;
            serviceId: string;
        }[];
    } & {
        id: string;
        name: string;
        workshopId: string;
        type: import(".prisma/client").$Enums.BayType;
        isActive: boolean;
    })[]>;
    generateSlots(bayId: string, date: Date, startStr: string, endStr: string, durationMin: number): Promise<never[]>;
    getSlots(bayId: string, date: Date): Promise<{
        id: string;
        createdAt: Date;
        jobCardId: string | null;
        bayId: string;
        date: Date;
        startTime: string;
        endTime: string;
        status: import(".prisma/client").$Enums.SlotStatus;
    }[]>;
    bookSlot(data: Prisma.SlotBookingCreateInput): Promise<{
        id: string;
        createdAt: Date;
        jobCardId: string | null;
        bayId: string;
        date: Date;
        startTime: string;
        endTime: string;
        status: import(".prisma/client").$Enums.SlotStatus;
    }>;
}
