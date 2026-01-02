import { SlotService } from './slot.service';
import { Prisma } from '@prisma/client';
export declare class SlotController {
    private readonly slotService;
    constructor(slotService: SlotService);
    createBay(data: Prisma.BayCreateInput): Promise<{
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
