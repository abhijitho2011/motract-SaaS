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
        const [bay] = await this.db.insert(schema.workshopBays).values({
            id: crypto.randomUUID(),
            workshopId: data.workshopId,
            name: data.name,
            serviceCategories: [data.type], // Map type to serviceCategories
            isActive: true
        }).returning();
        return bay;
    }

    async findBays(workshopId: string) {
        return this.db.query.workshopBays.findMany({
            where: eq(schema.workshopBays.workshopId, workshopId),
            with: { slots: true }
        });
    }

    async bookSlot(data: any) {
        // ... unused legacy logic update if needed, but keeping separate ...
        // Legacy bookSlot used slotBookings table. New system uses workshopBaySlots.
        // Leaving this as is if it's legacy api.
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
        const updateData: any = {
            name: data.name,
            isActive: data.isActive,
        };
        if (data.type) {
            updateData.serviceCategories = [data.type];
        }

        const [updated] = await this.db.update(schema.workshopBays)
            .set(updateData)
            .where(eq(schema.workshopBays.id, id))
            .returning();
        return updated;
    }

    async deleteBay(id: string, workshopId: string) {
        // Verify bay belongs to workshop before deleting
        const bay = await this.db.query.workshopBays.findFirst({
            where: and(eq(schema.workshopBays.id, id), eq(schema.workshopBays.workshopId, workshopId)),
        });

        if (!bay) {
            throw new NotFoundException('Bay not found or access denied');
        }

        await this.db.delete(schema.workshopBays).where(eq(schema.workshopBays.id, id));
        return { message: 'Bay deleted successfully' };
    }

    // =============================================
    // Enhanced Slot Management (for client booking)
    // =============================================

    // Create a manual slot (Time based)
    async createManualSlot(data: { workshopId: string; bayId: string; date: string; startTime: string; endTime: string }) {
        // 1. Verify bay belongs to workshop
        const bay = await this.db.query.workshopBays.findFirst({
            where: and(eq(schema.workshopBays.id, data.bayId), eq(schema.workshopBays.workshopId, data.workshopId)),
        });

        if (!bay) {
            throw new NotFoundException('Bay not found or access denied');
        }

        // 2. Validate time
        if (data.startTime >= data.endTime) {
            throw new Error('Start time must be before end time');
        }

        // 3. Check for overlaps
        // Overlap condition: (StartA < EndB) and (EndA > StartB)
        const overlaps = await this.db.select()
            .from(schema.workshopBaySlots)
            .where(and(
                eq(schema.workshopBaySlots.bayId, data.bayId),
                eq(schema.workshopBaySlots.date, data.date),

            ));

        // Filter in memory to be safe with string comparisons
        const hasOverlap = overlaps.some(slot => {
            return data.startTime < slot.endTime && data.endTime > slot.startTime;
        });

        if (hasOverlap) {
            throw new Error('Slot overlaps with an existing slot');
        }

        // 4. Create slot
        const [slot] = await this.db.insert(schema.workshopBaySlots).values({
            id: crypto.randomUUID(),
            bayId: data.bayId,
            date: data.date,
            startTime: data.startTime,
            endTime: data.endTime,
            status: 'AVAILABLE',
        }).returning();

        return slot;
    }

    // Generate daily slots for all bays of a workshop (Automatic)
    async generateDailySlots(workshopId: string, date: string) {
        // Get workshop working hours
        const workshopResult = await this.db.select({
            startHour: schema.workshops.workingStartHour,
            endHour: schema.workshops.workingEndHour,
            slotDuration: schema.workshops.slotDurationMin,
        })
            .from(schema.workshops)
            .where(eq(schema.workshops.id, workshopId))
            .limit(1);

        if (!workshopResult[0]) {
            throw new NotFoundException('Workshop not found');
        }

        const { startHour, endHour, slotDuration } = workshopResult[0];

        // Get all active bays
        const baysResult = await this.db.select()
            .from(schema.workshopBays)
            .where(and(
                eq(schema.workshopBays.workshopId, workshopId),
                eq(schema.workshopBays.isActive, true)
            ));

        if (baysResult.length === 0) {
            return { message: 'No active bays found', slotsCreated: 0 };
        }

        // Check if slots already exist for this date
        const existingSlots = await this.db.select()
            .from(schema.workshopBaySlots)
            .innerJoin(schema.workshopBays, eq(schema.workshopBaySlots.bayId, schema.workshopBays.id))
            .where(and(
                eq(schema.workshopBays.workshopId, workshopId),
                eq(schema.workshopBaySlots.date, date)
            ))
            .limit(1);

        if (existingSlots.length > 0) {
            return { message: 'Slots already exist for this date', slotsCreated: 0 };
        }

        // Generate time slots
        const slotsToCreate = [];
        const [startH, startM] = startHour.split(':').map(Number);
        const [endH, endM] = endHour.split(':').map(Number);

        let current = startH * 60 + startM;
        const end = endH * 60 + endM;

        while (current + slotDuration <= end) {
            const startTimeH = Math.floor(current / 60).toString().padStart(2, '0');
            const startTimeM = (current % 60).toString().padStart(2, '0');
            const endTimeH = Math.floor((current + slotDuration) / 60).toString().padStart(2, '0');
            const endTimeM = ((current + slotDuration) % 60).toString().padStart(2, '0');

            for (const bay of baysResult) {
                slotsToCreate.push({
                    id: crypto.randomUUID(),
                    bayId: bay.id,
                    date,
                    startTime: `${startTimeH}:${startTimeM}`,
                    endTime: `${endTimeH}:${endTimeM}`,
                    status: 'AVAILABLE' as any,
                });
            }

            current += slotDuration;
        }

        // Insert all slots
        if (slotsToCreate.length > 0) {
            await this.db.insert(schema.workshopBaySlots).values(slotsToCreate);
        }

        return {
            message: `Created ${slotsToCreate.length} slots for ${baysResult.length} bays`,
            slotsCreated: slotsToCreate.length,
        };
    }

    // Get slot grid for a specific date (for workshop app to view)
    async getSlotGrid(workshopId: string, date: string) {
        // Get bays
        const baysResult = await this.db.select()
            .from(schema.workshopBays)
            .where(and(
                eq(schema.workshopBays.workshopId, workshopId),
                eq(schema.workshopBays.isActive, true)
            ));

        // Get slots for the date
        const slotsResult = await this.db.select({
            slotId: schema.workshopBaySlots.id,
            bayId: schema.workshopBaySlots.bayId,
            startTime: schema.workshopBaySlots.startTime,
            endTime: schema.workshopBaySlots.endTime,
            status: schema.workshopBaySlots.status,
            bookingId: schema.workshopBaySlots.bookingId,
        })
            .from(schema.workshopBaySlots)
            .innerJoin(schema.workshopBays, eq(schema.workshopBaySlots.bayId, schema.workshopBays.id))
            .where(and(
                eq(schema.workshopBays.workshopId, workshopId),
                eq(schema.workshopBaySlots.date, date)
            ));

        return { bays: baysResult, slots: slotsResult, date };
    }

    // Block or unblock a specific slot
    async updateSlotStatus(slotId: string, workshopId: string, status: 'AVAILABLE' | 'BLOCKED') {
        // Verify slot belongs to workshop
        const slotResult = await this.db.select()
            .from(schema.workshopBaySlots)
            .innerJoin(schema.workshopBays, eq(schema.workshopBaySlots.bayId, schema.workshopBays.id))
            .where(and(
                eq(schema.workshopBaySlots.id, slotId),
                eq(schema.workshopBays.workshopId, workshopId)
            ))
            .limit(1);

        if (slotResult.length === 0) {
            throw new NotFoundException('Slot not found or access denied');
        }

        await this.db.update(schema.workshopBaySlots)
            .set({ status: status as any })
            .where(eq(schema.workshopBaySlots.id, slotId));

        return { message: `Slot ${status === 'BLOCKED' ? 'blocked' : 'unblocked'} successfully` };
    }

    // Get all bookings for a workshop
    async getWorkshopBookings(workshopId: string) {
        const bookings = await this.db.select({
            id: schema.workshopBookings.id,
            vehicleId: schema.workshopBookings.vehicleId,
            serviceCategories: schema.workshopBookings.serviceCategories,
            bookingDate: schema.workshopBookings.bookingDate,
            slotTime: schema.workshopBookings.slotTime,
            status: schema.workshopBookings.status,
            notes: schema.workshopBookings.notes,
            createdAt: schema.workshopBookings.createdAt,
            clientId: schema.workshopBookings.clientId,
        })
            .from(schema.workshopBookings)
            .where(eq(schema.workshopBookings.workshopId, workshopId));

        return bookings;
    }

    // Update booking status (confirm, complete, cancel)
    async updateBookingStatus(bookingId: string, workshopId: string, status: 'CONFIRMED' | 'COMPLETED' | 'CANCELLED') {
        const bookingResult = await this.db.select()
            .from(schema.workshopBookings)
            .where(and(
                eq(schema.workshopBookings.id, bookingId),
                eq(schema.workshopBookings.workshopId, workshopId)
            ))
            .limit(1);

        if (bookingResult.length === 0) {
            throw new NotFoundException('Booking not found or access denied');
        }

        await this.db.update(schema.workshopBookings)
            .set({
                status: status as any,
                updatedAt: new Date().toISOString(),
            })
            .where(eq(schema.workshopBookings.id, bookingId));

        return { message: `Booking ${status.toLowerCase()} successfully` };
    }

    // =============================================
    // Workshop Holidays (Day Blocking)
    // =============================================

    // Block entire day (holiday/unavailable)
    async blockEntireDay(workshopId: string, date: string, reason?: string) {
        // Check if already blocked
        const existing = await this.db.select()
            .from(schema.workshopHolidays)
            .where(and(
                eq(schema.workshopHolidays.workshopId, workshopId),
                eq(schema.workshopHolidays.date, date)
            ))
            .limit(1);

        if (existing.length > 0) {
            return { message: 'Day is already blocked' };
        }

        const [holiday] = await this.db.insert(schema.workshopHolidays).values({
            id: crypto.randomUUID(),
            workshopId,
            date,
            reason,
        }).returning();

        return { message: 'Day blocked successfully', holiday };
    }

    // Unblock day
    async unblockDay(workshopId: string, date: string) {
        await this.db.delete(schema.workshopHolidays)
            .where(and(
                eq(schema.workshopHolidays.workshopId, workshopId),
                eq(schema.workshopHolidays.date, date)
            ));
        return { message: 'Day unblocked successfully' };
    }

    // Get workshop holidays
    async getWorkshopHolidays(workshopId: string) {
        return this.db.select()
            .from(schema.workshopHolidays)
            .where(eq(schema.workshopHolidays.workshopId, workshopId));
    }

    // Get bay name templates (for workshop dropdown)
    async getBayNameTemplates() {
        return this.db.select()
            .from(schema.bayNameTemplates)
            .where(eq(schema.bayNameTemplates.isActive, true));
    }
}

