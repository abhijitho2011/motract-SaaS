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
    async adjustStock(itemId: string, quantity: number, reason: string) {
        if (quantity === 0) return this.findOne(itemId);

        // Positive Adjustment: Create "Adjustment Batch"
        if (quantity > 0) {
            await this.prisma.inventoryBatch.create({
                data: {
                    itemId,
                    batchNumber: `ADJ-${Date.now()}`,
                    quantity: quantity,
                    purchasePrice: 0, // No cost for found items? Or input needed? Assume 0 for now.
                    salePrice: 0, // Determine from existing? 
                },
            });
        }
        // Negative Adjustment: Deduct from batches (FIFO)
        else {
            const deduction = Math.abs(quantity);
            let remaining = deduction;

            // Get batches with stock
            const batches = await this.prisma.inventoryBatch.findMany({
                where: { itemId, quantity: { gt: 0 } },
                orderBy: { purchasedAt: 'asc' }, // FIFO
            });

            const updates = [];
            for (const batch of batches) {
                if (remaining <= 0) break;

                const take = Math.min(batch.quantity, remaining);
                updates.push(this.prisma.inventoryBatch.update({
                    where: { id: batch.id },
                    data: { quantity: { decrement: take } },
                }));
                remaining -= take;
            }

            if (remaining > 0) {
                throw new BadRequestException('Not enough stock to reduce');
            }

            await this.prisma.$transaction(updates);
        }

        return this.findOne(itemId);
    }
}
