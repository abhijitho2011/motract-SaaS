import { Injectable, Inject } from '@nestjs/common';
import { DrizzleAsyncProvider } from '../drizzle/drizzle.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../drizzle/schema';
import { inspectionMasters } from '../drizzle/schema';
import { eq, and } from 'drizzle-orm';
import * as crypto from 'crypto';

@Injectable()
export class InspectionService {
    constructor(
        @Inject(DrizzleAsyncProvider)
        private db: NodePgDatabase<typeof schema>,
    ) { }

    async create(data: { workshopId: string; category: string; name: string }) {
        const [item] = await this.db.insert(inspectionMasters).values({
            id: crypto.randomUUID(),
            ...data,
            isActive: true,
        }).returning();
        return item;
    }

    async findAll(workshopId: string) {
        return this.db.query.inspectionMasters.findMany({
            where: eq(inspectionMasters.workshopId, workshopId),
            orderBy: [schema.inspectionMasters.category, schema.inspectionMasters.name],
        });
    }

    async delete(id: string) {
        return this.db.delete(inspectionMasters).where(eq(inspectionMasters.id, id)).returning();
    }
}
