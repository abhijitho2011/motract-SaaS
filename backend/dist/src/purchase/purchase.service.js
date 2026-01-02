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
exports.PurchaseService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PurchaseService = class PurchaseService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createSupplier(data) {
        return this.prisma.supplier.create({ data });
    }
    async getSuppliers(workshopId) {
        return this.prisma.supplier.findMany({
            where: { workshopId },
            include: {
                orders: {
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                },
            },
        });
    }
    async getSupplier(id) {
        const supplier = await this.prisma.supplier.findUnique({
            where: { id },
            include: {
                orders: {
                    include: { items: true },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (!supplier)
            throw new common_1.NotFoundException('Supplier not found');
        return supplier;
    }
    async getSupplierLedger(id) {
        return this.prisma.purchaseOrder.findMany({
            where: { supplierId: id },
            orderBy: { createdAt: 'desc' },
            include: { items: true },
        });
    }
    async createPurchaseOrder(data) {
        const totalAmount = data.items.reduce((sum, item) => {
            const itemTotal = item.quantity * item.unitCost;
            const tax = itemTotal * (item.taxPercent / 100);
            return sum + itemTotal + tax;
        }, 0);
        return this.prisma.purchaseOrder.create({
            data: {
                workshopId: data.workshopId,
                supplierId: data.supplierId,
                invoiceDate: data.invoiceDate,
                invoiceNumber: data.invoiceNumber,
                totalAmount,
                status: 'DRAFT',
                items: {
                    create: data.items.map((item) => ({
                        itemName: item.itemName,
                        partNumber: item.partNumber,
                        quantity: item.quantity,
                        unitCost: item.unitCost,
                        taxPercent: item.taxPercent,
                        total: item.quantity * item.unitCost * (1 + item.taxPercent / 100),
                    })),
                },
            },
            include: {
                items: true,
                supplier: true,
            },
        });
    }
    async getPurchaseOrders(workshopId) {
        return this.prisma.purchaseOrder.findMany({
            where: { workshopId },
            include: {
                supplier: true,
                items: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getPurchaseOrder(id) {
        const po = await this.prisma.purchaseOrder.findUnique({
            where: { id },
            include: {
                supplier: true,
                items: true,
            },
        });
        if (!po)
            throw new common_1.NotFoundException('Purchase Order not found');
        return po;
    }
    async updatePurchaseOrderStatus(id, status) {
        return this.prisma.purchaseOrder.update({
            where: { id },
            data: { status },
        });
    }
    async receivePurchaseOrder(id) {
        const po = await this.prisma.purchaseOrder.findUnique({
            where: { id },
            include: { items: true },
        });
        if (!po)
            throw new common_1.NotFoundException('PO not found');
        if (po.status === 'RECEIVED')
            throw new Error('PO already received');
        await this.prisma.$transaction(async (tx) => {
            for (const item of po.items) {
                let invItem = await tx.inventoryItem.findFirst({
                    where: {
                        workshopId: po.workshopId,
                        name: {
                            equals: item.itemName,
                            mode: 'insensitive',
                        },
                    },
                });
                if (!invItem) {
                    invItem = await tx.inventoryItem.create({
                        data: {
                            workshopId: po.workshopId,
                            name: item.itemName,
                            brand: 'Generic',
                            hsnCode: '0000',
                            taxPercent: item.taxPercent,
                        },
                    });
                }
                await tx.inventoryBatch.create({
                    data: {
                        itemId: invItem.id,
                        batchNumber: `PO-${po.invoiceNumber ?? po.id.substring(0, 4)}`,
                        quantity: item.quantity,
                        purchasePrice: item.total / item.quantity,
                        salePrice: (item.total / item.quantity) * 1.5,
                    },
                });
            }
            await tx.purchaseOrder.update({
                where: { id },
                data: { status: 'RECEIVED' },
            });
        });
        return this.getPurchaseOrder(id);
    }
};
exports.PurchaseService = PurchaseService;
exports.PurchaseService = PurchaseService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PurchaseService);
//# sourceMappingURL=purchase.service.js.map