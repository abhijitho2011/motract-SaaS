import { InventoryService } from './inventory.service';
export declare class InventoryController {
    private readonly inventoryService;
    constructor(inventoryService: InventoryService);
    createItem(data: any): Promise<{
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
    addSku(id: string, skuCode: string): Promise<{
        id: string;
        itemId: string;
        skuCode: string;
    }[]>;
    addBatch(id: string, body: any): Promise<{
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
    addCompatibility(id: string, modelId: string, variantId?: string): Promise<{
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
    getCompatibility(id: string): Promise<{
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
    adjustStock(id: string, quantity: number, reason: string): Promise<any>;
    getExpiringBatches(workshopId: string): Promise<{
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
