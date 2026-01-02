import { Injectable, Inject } from '@nestjs/common';
import { DrizzleAsyncProvider } from '../drizzle/drizzle.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../drizzle/schema';
import { bays, slotBookings } from '../drizzle/schema';
import { eq, and } from 'drizzle-orm';
import * as crypto from 'crypto';
import { BayType, SlotStatus } from '../drizzle/types';

@Injectable()
export class SlotService {
  constructor(
    @Inject(DrizzleAsyncProvider)
    private db: NodePgDatabase<typeof schema>,
  ) { }

  async createBay(data: { workshopId: string; name: string; type: BayType }) {
    const result = await this.db
      .insert(bays)
      .values({
        id: crypto.randomUUID(),
        workshopId: data.workshopId,
        name: data.name,
        type: data.type, // Enum compatibility might need casting or matching strings
        isActive: true,
      })
      .returning();
    return result[0];
  }

  async findBays(workshopId: string) {
    // using query builder with relations
    return this.db.query.bays.findMany({
      where: eq(bays.workshopId, workshopId),
      // with: { services: true }, // Uncomment when services relation is confirmed in relations.ts
      // For now, if services relation is in serviceBayMapping, we might need to adjust
    });
  }

  async generateSlots(
    bayId: string,
    date: Date,
    startStr: string,
    endStr: string,
    durationMin: number,
  ) {
    return [];
  }

  async getSlots(bayId: string, date: Date) {
    // Date comparison in Drizzle/SQL might need formatting
    // Assuming exact match for now as per original code
    const dateStr = date.toISOString(); // or however it was stored
    // Actually, original code used Date object. In Postgres it's timestamp.
    // Drizzle will handle Date object for timestamp columns.
    return this.db
      .select()
      .from(slotBookings)
      .where(and(eq(slotBookings.bayId, bayId), eq(slotBookings.date, dateStr as any)));
  }

  async bookSlot(data: typeof slotBookings.$inferInsert) {
    const result = await this.db.insert(slotBookings).values(data).returning();
    return result[0];
  }
}
