import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../drizzle/schema';
import { inventoryItems } from '../drizzle/schema';
export declare class InventoryService {
    private db;
    constructor(db: NodePgDatabase<typeof schema>);
    createItem(data: typeof inventoryItems.$inferInsert): Promise<{
        partNumbers: never[];
        batches: never[];
        id: string;
        name: string;
        brand: string | null;
        createdAt: string;
        updatedAt: string;
        workshopId: string;
        isOem: boolean;
        hsnCode: string | null;
        taxPercent: number;
        reorderLevel: number | null;
        description: string | null;
        brandId: string | null;
        categoryId: string | null;
        subCategoryId: string | null;
    }>;
    addSku(itemId: string, skuCode: string): Promise<{
        id: string;
        itemId: string;
        skuCode: string;
    }[]>;
    addBatch(itemId: string, data: {
        quantity: number;
        purchasePrice: number;
        salePrice: number;
        batchNumber?: string;
        expiryDate?: Date;
    }): Promise<{
        id: string;
        itemId: string;
        quantity: number;
        batchNumber: string | null;
        expiryDate: string | null;
        purchasePrice: number;
        salePrice: number;
        purchasedAt: string;
    }[]>;
    findAll(workshopId: string): Promise<{
        id: string;
        name: string;
        brand: string | null;
        createdAt: string;
        updatedAt: string;
        workshopId: string;
        isOem: boolean;
        hsnCode: string | null;
        taxPercent: number;
        reorderLevel: number | null;
        description: string | null;
        brandId: string | null;
        categoryId: string | null;
        subCategoryId: string | null;
        inventoryPartNumbers: {
            id: string;
            itemId: string;
            skuCode: string;
        }[];
        inventoryBatches: {
            id: string;
            itemId: string;
            quantity: number;
            batchNumber: string | null;
            expiryDate: string | null;
            purchasePrice: number;
            salePrice: number;
            purchasedAt: string;
        }[];
    }[]>;
    findOne(id: string): Promise<any>;
    addCompatibility(itemId: string, modelId: string, variantId?: string): Promise<{
        id: string;
        modelId: string;
        variantId: string | null;
        itemId: string;
        model: {
            id: string;
            name: string;
            makeId: string;
        };
    } | undefined>;
    getCompatibility(itemId: string): Promise<{
        id: string;
        modelId: string;
        variantId: string | null;
        itemId: string;
        model: {
            id: string;
            name: string;
            makeId: string;
        };
    }[]>;
    adjustStock(itemId: string, quantity: number, reason: string): Promise<any>;
    getExpiringBatches(workshopId: string, daysThreshold?: number): Promise<{
        batch: {
            id: string;
            itemId: string;
            batchNumber: string | null;
            expiryDate: string | null;
            quantity: number;
            purchasePrice: number;
            salePrice: number;
            purchasedAt: string;
        };
        item: {
            id: string;
            workshopId: string;
            name: string;
            brand: string | null;
            isOem: boolean;
            hsnCode: string | null;
            taxPercent: number;
            reorderLevel: number | null;
            description: string | null;
            brandId: string | null;
            categoryId: string | null;
            subCategoryId: string | null;
            createdAt: string;
            updatedAt: string;
        };
    }[]>;
}
