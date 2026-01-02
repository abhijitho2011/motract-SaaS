import { SlotService } from './slot.service';
import { BayType } from '../drizzle/types';
export declare class SlotController {
    private readonly slotService;
    constructor(slotService: SlotService);
    setWorkingHours(body: {
        workshopId: string;
        hours: {
            dayOfWeek: string;
            openingTime: string;
            closingTime: string;
        }[];
    }): Promise<{
        id: string;
        workshopId: string;
        dayOfWeek: string;
        openingTime: string;
        closingTime: string;
    }[]>;
    getWorkingHours(workshopId: string): Promise<{
        id: string;
        workshopId: string;
        dayOfWeek: string;
        openingTime: string;
        closingTime: string;
    }[]>;
    setBreaks(body: {
        workshopId: string;
        breaks: {
            title: string;
            startTime: string;
            endTime: string;
        }[];
    }): Promise<{
        id: string;
        workshopId: string;
        title: string;
        startTime: string;
        endTime: string;
    }[]>;
    createBay(data: {
        workshopId: string;
        name: string;
        type: BayType;
    }): Promise<{
        id: string;
        name: string;
        type: "SERVICE" | "WASHING" | "ALIGNMENT" | "ELECTRICAL" | "GENERAL";
        workshopId: string;
        isActive: boolean;
    }>;
    findBays(workshopId: string): Promise<{
        id: string;
        name: string;
        type: "SERVICE" | "WASHING" | "ALIGNMENT" | "ELECTRICAL" | "GENERAL";
        workshopId: string;
        isActive: boolean;
        serviceBayMappings: {
            id: string;
            serviceId: string;
            bayId: string;
            service: {
                id: string;
                name: string;
                workshopId: string;
                price: number | null;
                durationMin: number;
            };
        }[];
    }[]>;
    mapService(bayId: string, serviceId: string): Promise<{
        id: string;
        serviceId: string;
        bayId: string;
    }[]>;
    getAvailableSlots(workshopId: string, date: string, serviceId: string): Promise<{
        startTime: string;
        endTime: string;
        status: string;
        availableBays: number;
    }[]>;
    bookSlot(data: {
        workshopId: string;
        serviceId: string;
        date: string;
        startTime: string;
        jobCardId?: string;
    }): Promise<{
        date: string;
        id: string;
        status: "AVAILABLE" | "BOOKED" | "BLOCKED";
        createdAt: string;
        jobCardId: string | null;
        startTime: string;
        endTime: string;
        bayId: string;
    }>;
}
