import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
export declare class InventoryService {
    private prisma;
    constructor(prisma: PrismaService);
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
