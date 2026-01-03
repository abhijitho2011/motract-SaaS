import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DrizzleAsyncProvider } from '../drizzle/drizzle.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../drizzle/schema';
import { bays, slotBookings } from '../drizzle/schema';
import { eq, and } from 'drizzle-orm';
import * as crypto from 'crypto';

@Injectable()
export class SlotService {
    constructor(
        @Inject(DrizzleAsyncProvider)
        private db: NodePgDatabase<typeof schema>,
    ) { }

    async createBay(data: any) {
        const [bay] = await this.db.insert(bays).values({
            id: crypto.randomUUID(),
            workshopId: data.workshopId,
            name: data.name,
            type: data.type,
            isActive: true
        }).returning();
        return bay;
    }

    async findBays(workshopId: string) {
        return this.db.query.bays.findMany({
            where: eq(bays.workshopId, workshopId),
            with: { slotBookings: true }
        });
    }

    async bookSlot(data: any) {
        const [booking] = await this.db.insert(slotBookings).values({
            id: crypto.randomUUID(),
            bayId: data.bayId,
            date: data.date,
            startTime: data.startTime,
            endTime: data.endTime,
            status: 'BOOKED',
            jobCardId: data.jobCardId || null,
        }).returning();
        return booking;
    }

    async updateBay(id: string, data: { name?: string; type?: string; isActive?: boolean }) {
        const [updated] = await this.db.update(bays)
            .set({
                name: data.name,
                type: data.type as any,
                isActive: data.isActive,
            })
            .where(eq(bays.id, id))
            .returning();
        return updated;
    }

    async deleteBay(id: string, workshopId: string) {
        // Verify bay belongs to workshop before deleting
        const bay = await this.db.query.bays.findFirst({
            where: and(eq(bays.id, id), eq(bays.workshopId, workshopId)),
        });

        if (!bay) {
            throw new NotFoundException('Bay not found or access denied');
        }

        await this.db.delete(bays).where(eq(bays.id, id));
        return { message: 'Bay deleted successfully' };
    }
}
