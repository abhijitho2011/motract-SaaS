import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
export declare class InventoryService {
    private prisma;
    constructor(prisma: PrismaService);
    createItem(data: Prisma.InventoryItemCreateInput): Promise<{
        partNumbers: {
            id: string;
            itemId: string;
            skuCode: string;
        }[];
        batches: {
            id: string;
            quantity: number;
            itemId: string;
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
    addSku(itemId: string, skuCode: string): Promise<{
        id: string;
        itemId: string;
        skuCode: string;
    }>;
    addBatch(itemId: string, data: {
        quantity: number;
        purchasePrice: number;
        salePrice: number;
        batchNumber?: string;
        expiryDate?: Date;
    }): Promise<{
        id: string;
        quantity: number;
        itemId: string;
        batchNumber: string | null;
        expiryDate: Date | null;
        purchasePrice: number;
        salePrice: number;
        purchasedAt: Date;
    }>;
    findAll(workshopId: string): Promise<({
        partNumbers: {
            id: string;
            itemId: string;
            skuCode: string;
        }[];
        batches: {
            id: string;
            quantity: number;
            itemId: string;
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
        partNumbers: {
            id: string;
            itemId: string;
            skuCode: string;
        }[];
        batches: {
            id: string;
            quantity: number;
            itemId: string;
            batchNumber: string | null;
            expiryDate: Date | null;
            purchasePrice: number;
            salePrice: number;
            purchasedAt: Date;
        }[];
        compatibleVehicles: ({
            model: {
                id: string;
                name: string;
                makeId: string;
            };
        } & {
            id: string;
            modelId: string;
            variantId: string | null;
            itemId: string;
        })[];
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
    addCompatibility(itemId: string, modelId: string, variantId?: string): Promise<{
        model: {
            id: string;
            name: string;
            makeId: string;
        };
    } & {
        id: string;
        modelId: string;
        variantId: string | null;
        itemId: string;
    }>;
    getCompatibility(itemId: string): Promise<({
        model: {
            id: string;
            name: string;
            makeId: string;
        };
    } & {
        id: string;
        modelId: string;
        variantId: string | null;
        itemId: string;
    })[]>;
    adjustStock(itemId: string, quantity: number, reason: string): Promise<{
        partNumbers: {
            id: string;
            itemId: string;
            skuCode: string;
        }[];
        batches: {
            id: string;
            quantity: number;
            itemId: string;
            batchNumber: string | null;
            expiryDate: Date | null;
            purchasePrice: number;
            salePrice: number;
            purchasedAt: Date;
        }[];
        compatibleVehicles: ({
            model: {
                id: string;
                name: string;
                makeId: string;
            };
        } & {
            id: string;
            modelId: string;
            variantId: string | null;
            itemId: string;
        })[];
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
