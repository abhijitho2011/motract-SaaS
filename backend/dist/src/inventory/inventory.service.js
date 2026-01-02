"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let InventoryService = class InventoryService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createItem(data) {
        return this.prisma.inventoryItem.create({
            data,
            include: { partNumbers: true, batches: true },
        });
    }
    async addSku(itemId, skuCode) {
        return this.prisma.inventoryPartNumber.create({
            data: { itemId, skuCode },
        });
    }
    async addBatch(itemId, data) {
        return this.prisma.inventoryBatch.create({
            data: {
                itemId,
                ...data,
            },
        });
    }
    async findAll(workshopId) {
        return this.prisma.inventoryItem.findMany({
            where: { workshopId },
            include: { partNumbers: true, batches: true },
        });
    }
    async findOne(id) {
        const item = await this.prisma.inventoryItem.findUnique({
            where: { id },
            include: { partNumbers: true, batches: true, compatibleVehicles: { include: { model: true } } },
        });
        if (!item)
            throw new common_1.NotFoundException('Item not found');
        return item;
    }
    async addCompatibility(itemId, modelId, variantId) {
        const existing = await this.prisma.inventoryVehicleMapping.findFirst({
            where: { itemId, modelId, variantId },
        });
        if (existing)
            throw new common_1.BadRequestException('Mapping already exists');
        return this.prisma.inventoryVehicleMapping.create({
            data: { itemId, modelId, variantId },
            include: { model: true },
        });
    }
    async getCompatibility(itemId) {
        return this.prisma.inventoryVehicleMapping.findMany({
            where: { itemId },
            include: { model: true },
        });
    }
    async adjustStock(itemId, quantity, reason) {
        if (quantity === 0)
            return this.findOne(itemId);
        if (quantity > 0) {
            await this.prisma.inventoryBatch.create({
                data: {
                    itemId,
                    batchNumber: `ADJ-${Date.now()}`,
                    quantity: quantity,
                    purchasePrice: 0,
                    salePrice: 0,
                },
            });
        }
        else {
            const deduction = Math.abs(quantity);
            let remaining = deduction;
            const batches = await this.prisma.inventoryBatch.findMany({
                where: { itemId, quantity: { gt: 0 } },
                orderBy: { purchasedAt: 'asc' },
            });
            const updates = [];
            for (const batch of batches) {
                if (remaining <= 0)
                    break;
                const take = Math.min(batch.quantity, remaining);
                updates.push(this.prisma.inventoryBatch.update({
                    where: { id: batch.id },
                    data: { quantity: { decrement: take } },
                }));
                remaining -= take;
            }
            if (remaining > 0) {
                throw new common_1.BadRequestException('Not enough stock to reduce');
            }
            await this.prisma.$transaction(updates);
        }
        return this.findOne(itemId);
    }
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InventoryService);
//# sourceMappingURL=inventory.service.js.map