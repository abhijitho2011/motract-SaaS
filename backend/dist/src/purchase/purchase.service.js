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
    async getSupplierLedger(supplierId) {
        const orders = await this.prisma.purchaseOrder.findMany({
            where: { supplierId },
            orderBy: { invoiceDate: 'desc' },
            include: {
                items: true,
            },
        });
        const totalPurchases = orders.reduce((sum, order) => sum + order.totalAmount, 0);
        const pendingOrders = orders.filter((o) => o.status === 'DRAFT').length;
        return {
            supplierId,
            totalPurchases,
            pendingOrders,
            orders,
        };
    }
};
exports.PurchaseService = PurchaseService;
exports.PurchaseService = PurchaseService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PurchaseService);
//# sourceMappingURL=purchase.service.js.map