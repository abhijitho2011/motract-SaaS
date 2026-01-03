import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../drizzle/schema';
export declare class InventoryService {
    private db;
    constructor(db: NodePgDatabase<typeof schema>);
    getBrands(): Promise<{
        id: string;
        name: string;
    }[]>;
    createBrand(name: string): Promise<{
        id: string;
        name: string;
    }>;
    getCategories(): Promise<{
        id: string;
        name: string;
    }[]>;
    createCategory(name: string): Promise<{
        id: string;
        name: string;
    }>;
    getSubCategories(categoryId?: string): Promise<{
        id: string;
        name: string;
        categoryId: string;
    }[]>;
    createSubCategory(categoryId: string, name: string): Promise<{
        id: string;
        name: string;
        categoryId: string;
    }>;
    createItem(data: any): Promise<any>;
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
        reorderLevel: number;
        categoryId: string;
        subCategoryId: string | null;
        description: string | null;
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
}
