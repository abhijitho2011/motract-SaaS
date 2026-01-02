import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class InventoryService {
    constructor(private prisma: PrismaService) { }

    async createItem(data: Prisma.InventoryItemCreateInput) {
        return this.prisma.inventoryItem.create({
            data,
            include: { skus: true, batches: true },
        });
    }

    async addSku(itemId: string, skuCode: string) {
        return this.prisma.inventorySku.create({
            data: { itemId, skuCode },
        });
    }

    async addBatch(itemId: string, data: {
        quantity: number;
        purchasePrice: number;
        salePrice: number;
        batchNumber?: string;
        expiryDate?: Date;
    }) {
        return this.prisma.inventoryBatch.create({
            data: {
                itemId,
                ...data,
            },
        });
    }

    async findAll(workshopId: string) {
        return this.prisma.inventoryItem.findMany({
            where: { workshopId },
            include: { skus: true, batches: true },
        });
    }

    async findOne(id: string) {
        const item = await this.prisma.inventoryItem.findUnique({
            where: { id },
            include: { skus: true, batches: true, compatibleVehicles: { include: { model: true } } },
        });
        if (!item) throw new NotFoundException('Item not found');
        return item;
    }

    async addCompatibility(itemId: string, modelId: string, variantId?: string) {
        // Check if mapping exists
        const existing = await this.prisma.inventoryVehicleMapping.findFirst({
            where: { itemId, modelId, variantId },
        });
        if (existing) throw new BadRequestException('Mapping already exists');

        return this.prisma.inventoryVehicleMapping.create({
            data: { itemId, modelId, variantId },
            include: { model: true },
        });
    }

    async getCompatibility(itemId: string) {
        return this.prisma.inventoryVehicleMapping.findMany({
            where: { itemId },
            include: { model: true },
        });
    }
}
