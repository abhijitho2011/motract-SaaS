import { SlotService } from './slot.service';
export declare class SlotController {
    private readonly slotService;
    constructor(slotService: SlotService);
    createBay(data: {
        workshopId: string;
        name: string;
        type: 'SERVICE' | 'WASHING' | 'ALIGNMENT' | 'ELECTRICAL' | 'GENERAL';
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
