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
            include: { skus: true, batches: true },
        });
        if (!item) throw new NotFoundException('Item not found');
        return item;
    }
}
