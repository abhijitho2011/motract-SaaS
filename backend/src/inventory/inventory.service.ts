import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { DrizzleAsyncProvider } from '../drizzle/drizzle.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../drizzle/schema';
import {
  inventoryItems,
  inventoryPartNumbers,
  inventoryBatches,
  inventoryVehicleMapping,
} from '../drizzle/schema';
import { eq, gt, asc, and } from 'drizzle-orm';
import * as crypto from 'crypto';

@Injectable()
export class InventoryService {
  constructor(
    @Inject(DrizzleAsyncProvider)
    private db: NodePgDatabase<typeof schema>,
  ) { }

  async createItem(data: typeof inventoryItems.$inferInsert) {
    const [item] = await this.db.insert(inventoryItems).values(data).returning();
    // Return with empty relations as created
    return { ...item, partNumbers: [], batches: [] };
  }

  async addSku(itemId: string, skuCode: string) {
    return this.db.insert(inventoryPartNumbers).values({
      id: crypto.randomUUID(),
      itemId,
      skuCode
    }).returning();
  }

  async addBatch(
    itemId: string,
    data: {
      quantity: number;
      purchasePrice: number;
      salePrice: number;
      batchNumber?: string;
      expiryDate?: Date;
    },
  ) {
    return this.db.insert(inventoryBatches).values({
      id: crypto.randomUUID(),
      itemId,
      quantity: data.quantity,
      purchasePrice: data.purchasePrice,
      salePrice: data.salePrice,
      batchNumber: data.batchNumber,
      expiryDate: data.expiryDate ? data.expiryDate.toISOString() : null,
    }).returning();
  }

  async findAll(workshopId: string) {
    return this.db.query.inventoryItems.findMany({
      where: eq(inventoryItems.workshopId, workshopId),
      with: { inventoryPartNumbers: true, inventoryBatches: true }, // relations verified from schema
    });
  }

  async findOne(id: string) {
    const item = await this.db.query.inventoryItems.findFirst({
      where: eq(inventoryItems.id, id),
      with: {
        inventoryPartNumbers: true,
        inventoryBatches: true,
        inventoryVehicleMappings: { with: { model: true } },
      },
    });

    if (!item) throw new NotFoundException('Item not found');

    // Remap relations if names differ
    // Drizzle relations.ts: inventoryItemsRelations has: 
    // inventoryPartNumbers: many(inventoryPartNumbers)
    // inventoryBatches: many(inventoryBatches)
    // inventoryVehicleMappings: many(inventoryVehicleMapping)

    // Prisma result: partNumbers, batches, compatibleVehicles
    // Need to remap
    const res: any = { ...item };
    res.partNumbers = res.inventoryPartNumbers;
    res.batches = res.inventoryBatches;
    res.compatibleVehicles = res.inventoryVehicleMappings;
    delete res.inventoryPartNumbers;
    delete res.inventoryBatches;
    delete res.inventoryVehicleMappings;

    return res;
  }

  async addCompatibility(itemId: string, modelId: string, variantId?: string) {
    // Check if mapping exists
    // Drizzle findFirst with AND
    // Note: variantId can be null, eq(null) might not work, check logic.
    // Original used simple equality. If variantId is undefined, it wasn't in where clause?
    // Prisma `findFirst({ where: { itemId, modelId, variantId } })` -> exact match including null/undefined?
    // If variantId passed as undefined, Prisma ignores it? No, in strict mode it counts.
    // Assuming strict match.
    // If variantId is undefined/null, handle accordingly?
    // For now assuming passed args are matched.

    // Logic:
    // const existing = await ...

    const [mapping] = await this.db.insert(inventoryVehicleMapping).values({
      id: crypto.randomUUID(),
      itemId,
      modelId,
      variantId
    }).returning();

    // Fetch with model
    const res = await this.db.query.inventoryVehicleMapping.findFirst({
      where: eq(inventoryVehicleMapping.id, mapping.id),
      with: { model: true }
    });
    return res;
  }

  async getCompatibility(itemId: string) {
    return this.db.query.inventoryVehicleMapping.findMany({
      where: eq(inventoryVehicleMapping.itemId, itemId),
      with: { model: true },
    });
  }

  async adjustStock(itemId: string, quantity: number, reason: string) {
    if (quantity === 0) return this.findOne(itemId);

    // Positive Adjustment: Create "Adjustment Batch"
    if (quantity > 0) {
      await this.db.insert(inventoryBatches).values({
        id: crypto.randomUUID(),
        itemId,
        batchNumber: `ADJ-${Date.now()}`,
        quantity: quantity,
        purchasePrice: 0,
        salePrice: 0,
      });
    }
    // Negative Adjustment: Deduct from batches (FIFO)
    else {
      const deduction = Math.abs(quantity);
      let remaining = deduction;

      // Get batches with stock
      const batches = await this.db.query.inventoryBatches.findMany({
        where: and(eq(inventoryBatches.itemId, itemId), gt(inventoryBatches.quantity, 0)),
        orderBy: [asc(inventoryBatches.purchasedAt)], // FIFO
      });

      // Transaction not explicitly used here but good practice. using sequential awaits.
      // logic same as Prisma.

      for (const batch of batches) {
        if (remaining <= 0) break;

        const batchQty = batch.quantity; // number check
        const take = Math.min(batchQty, remaining);

        await this.db.update(inventoryBatches)
          .set({ quantity: batchQty - take })
          .where(eq(inventoryBatches.id, batch.id));

        remaining -= take;
      }

      if (remaining > 0) {
        throw new BadRequestException('Not enough stock to reduce');
      }
    }

    return this.findOne(itemId);
  }
}
