import { InventoryService } from './inventory.service';
import { Prisma } from '@prisma/client';
export declare class InventoryController {
    private readonly inventoryService;
    constructor(inventoryService: InventoryService);
    createItem(data: Prisma.InventoryItemCreateInput): Promise<{
        skus: {
            id: string;
            itemId: string;
            skuCode: string;
        }[];
        batches: {
            id: string;
            itemId: string;
            quantity: number;
            batchNumber: string | null;
            expiryDate: Date | null;
            purchasePrice: number;
            salePrice: number;
            purchasedAt: Date;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        workshopId: string;
        brand: string | null;
        isOem: boolean;
        hsnCode: string | null;
        taxPercent: number;
    }>;
    addSku(id: string, skuCode: string): Promise<{
        id: string;
        itemId: string;
        skuCode: string;
    }>;
    addBatch(id: string, body: any): Promise<{
        id: string;
        itemId: string;
        quantity: number;
        batchNumber: string | null;
        expiryDate: Date | null;
        purchasePrice: number;
        salePrice: number;
        purchasedAt: Date;
    }>;
    findAll(workshopId: string): Promise<({
        skus: {
            id: string;
            itemId: string;
            skuCode: string;
        }[];
        batches: {
            id: string;
            itemId: string;
            quantity: number;
            batchNumber: string | null;
            expiryDate: Date | null;
            purchasePrice: number;
            salePrice: number;
            purchasedAt: Date;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        workshopId: string;
        brand: string | null;
        isOem: boolean;
        hsnCode: string | null;
        taxPercent: number;
    })[]>;
    findOne(id: string): Promise<{
        skus: {
            id: string;
            itemId: string;
            skuCode: string;
        }[];
        batches: {
            id: string;
            itemId: string;
            quantity: number;
            batchNumber: string | null;
            expiryDate: Date | null;
            purchasePrice: number;
            salePrice: number;
            purchasedAt: Date;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        workshopId: string;
        brand: string | null;
        isOem: boolean;
        hsnCode: string | null;
        taxPercent: number;
    }>;
}
