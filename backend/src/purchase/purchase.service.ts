import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { DrizzleAsyncProvider } from '../drizzle/drizzle.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../drizzle/schema';
import {
  suppliers,
  purchases,
  purchaseItems,
  inventoryItems,
  inventoryBatches,
} from '../drizzle/schema';
import { eq, desc, ilike } from 'drizzle-orm';
import * as crypto from 'crypto';

@Injectable()
export class PurchaseService {
  constructor(
    @Inject(DrizzleAsyncProvider)
    private db: NodePgDatabase<typeof schema>,
  ) { }

  // Supplier Management
  async createSupplier(data: typeof suppliers.$inferInsert) {
    const [supplier] = await this.db.insert(suppliers).values({
      id: crypto.randomUUID(),
      ...data
    }).returning();
    return supplier;
  }

  async getSuppliers(workshopId: string) {
    return this.db.query.suppliers.findMany({
      where: eq(suppliers.workshopId, workshopId),
      with: {
        purchases: { // 'orders' -> 'purchases' in relations.ts schema
          orderBy: [desc(purchases.createdAt)],
          limit: 5,
        },
      },
    });
  }

  async getSupplier(id: string) {
    const supplier = await this.db.query.suppliers.findFirst({
      where: eq(suppliers.id, id),
      with: {
        purchases: {
          with: { purchaseItems: true }, // items
          orderBy: [desc(purchases.createdAt)],
        },
      },
    });
    if (!supplier) throw new NotFoundException('Supplier not found');

    // Remap orders -> purchases for frontend if strictly needed, or frontend adapts.
    // Assuming backend keeps API consistent rename property.
    const res: any = { ...supplier };
    res.orders = res.purchases;
    delete res.purchases;
    // Map items in orders? purchaseItems -> items
    res.orders.forEach((o: any) => {
      o.items = o.purchaseItems;
      delete o.purchaseItems;
    });

    return res;
  }

  async getSupplierLedger(id: string) {
    // Return transaction history for a supplier
    const orders = await this.db.query.purchases.findMany({
      where: eq(purchases.supplierId, id),
      orderBy: [desc(purchases.createdAt)],
      with: { purchaseItems: true },
    });

    return orders.map((o: any) => ({ ...o, items: o.purchaseItems }));
  }

  // Purchase Order Management
  async createPurchaseOrder(data: {
    workshopId: string;
    supplierId: string;
    invoiceDate: Date;
    invoiceNumber?: string;
    items: Array<{
      itemName: string;
      partNumber?: string;
      quantity: number;
      unitCost: number;
      taxPercent: number;
    }>;
  }) {
    const totalAmount = data.items.reduce((sum, item) => {
      const itemTotal = item.quantity * item.unitCost;
      const tax = itemTotal * (item.taxPercent / 100);
      return sum + itemTotal + tax;
    }, 0);

    // Transaction to create PO and Items
    return await this.db.transaction(async (tx) => {
      const [po] = await tx.insert(purchases).values({
        id: crypto.randomUUID(),
        workshopId: data.workshopId,
        supplierId: data.supplierId,
        invoiceDate: data.invoiceDate.toISOString(),
        invoiceNumber: data.invoiceNumber,
        totalAmount,
        status: 'DRAFT',
      }).returning();

      if (data.items.length > 0) {
        await tx.insert(purchaseItems).values(
          data.items.map((item) => ({
            id: crypto.randomUUID(),
            orderId: po.id,
            itemName: item.itemName,
            partNumber: item.partNumber,
            quantity: item.quantity,
            unitCost: item.unitCost,
            taxPercent: item.taxPercent,
            total: item.quantity * item.unitCost * (1 + item.taxPercent / 100),
          }))
        );
      }

      // Return with includes
      const fullPo = await tx.query.purchases.findFirst({
        where: eq(purchases.id, po.id),
        with: { purchaseItems: true, supplier: true }
      });

      // Remap
      const res: any = { ...fullPo };
      res.items = res.purchaseItems;
      delete res.purchaseItems;
      return res;
    });
  }

  async getPurchaseOrders(workshopId: string) {
    const orders = await this.db.query.purchases.findMany({
      where: eq(purchases.workshopId, workshopId),
      with: {
        supplier: true,
        purchaseItems: true,
      },
      orderBy: [desc(purchases.createdAt)],
    });
    return orders.map((o: any) => ({ ...o, items: o.purchaseItems }));
  }

  async getPurchaseOrder(id: string) {
    const po = await this.db.query.purchases.findFirst({
      where: eq(purchases.id, id),
      with: {
        supplier: true,
        purchaseItems: true,
      },
    });
    if (!po) throw new NotFoundException('Purchase Order not found');

    const res: any = { ...po };
    res.items = res.purchaseItems;
    delete res.purchaseItems;
    return res;
  }

  async updatePurchaseOrderStatus(id: string, status: string) {
    return this.db.update(purchases)
      .set({ status })
      .where(eq(purchases.id, id))
      .returning();
  }

  // Receive PO and Update Stock
  async receivePurchaseOrder(id: string) {
    const po = await this.db.query.purchases.findFirst({
      where: eq(purchases.id, id),
      with: { purchaseItems: true },
    });

    if (!po) throw new NotFoundException('PO not found');
    if (po.status === 'RECEIVED') throw new Error('PO already received');

    // Update Stock
    await this.db.transaction(async (tx) => {
      for (const item of po.purchaseItems) {
        // 1. Find or Create Inventory Item
        let invItem = await tx.query.inventoryItems.findFirst({
          where: and(
            eq(inventoryItems.workshopId, po.workshopId),
            ilike(inventoryItems.name, item.itemName) // insensitive like
          ),
        });

        if (!invItem) {
          const [created] = await tx.insert(inventoryItems).values({
            id: crypto.randomUUID(),
            workshopId: po.workshopId,
            name: item.itemName,
            brand: 'Generic',
            hsnCode: '0000',
            taxPercent: item.taxPercent,
          }).returning();
          invItem = created;
        }

        // 2. Create Batch
        await tx.insert(inventoryBatches).values({
          id: crypto.randomUUID(),
          itemId: invItem.id,
          batchNumber: `PO-${po.invoiceNumber ?? po.id.substring(0, 4)}`,
          quantity: item.quantity,
          purchasePrice: item.total / item.quantity, // Unit Price (Tax Inc)
          salePrice: (item.total / item.quantity) * 1.5, // 50% Margin Default
        });
      }

      // 3. Update PO Status
      await tx.update(purchases)
        .set({ status: 'RECEIVED' })
        .where(eq(purchases.id, id));
    });

    return this.getPurchaseOrder(id);
  }
}
