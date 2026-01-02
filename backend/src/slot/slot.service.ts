import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, BayType, SlotStatus } from '@prisma/client';

@Injectable()
export class SlotService {
    constructor(private prisma: PrismaService) { }

    async createBay(data: { workshopId: string; name: string; type: BayType }) {
        return this.prisma.bay.create({
            data: {
                name: data.name,
                type: data.type,
                workshop: { connect: { id: data.workshopId } },
            },
        });
    }

    async findBays(workshopId: string) {
        return this.prisma.bay.findMany({ where: { workshopId }, include: { services: true } });
    }

    async generateSlots(bayId: string, date: Date, startStr: string, endStr: string, durationMin: number) {
        // Implementation simplified for Phase 1: Just create slot records
        // Real implementation would calculate intervals
        // For now, let's assume slots are pre-generated or generated on demand

        // Example logic:
        // 09:00, 09:30, 10:00...

        return []; // TODO: Implement full generation logic
    }

    async getSlots(bayId: string, date: Date) {
        // Return valid slots
        return this.prisma.slotBooking.findMany({
            where: { bayId, date: date },
        });
    }

    async bookSlot(data: Prisma.SlotBookingCreateInput) {
        return this.prisma.slotBooking.create({ data });
    }
}
