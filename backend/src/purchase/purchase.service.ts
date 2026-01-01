import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PurchaseService {
    constructor(private prisma: PrismaService) { }

    // Supplier Management
    async createSupplier(data: Prisma.SupplierCreateInput) {
        return this.prisma.supplier.create({ data });
    }

    async getSuppliers(workshopId: string) {
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

    async getSupplier(id: string) {
        const supplier = await this.prisma.supplier.findUnique({
            where: { id },
            include: {
                orders: {
                    include: { items: true },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (!supplier) throw new NotFoundException('Supplier not found');
        return supplier;
    }

    // Purchase Order Management
    async createPurchaseOrder(data: {
        workshopId: string;
        supplierId: string;
        invoiceDate: Date;
        invoiceNumber?: string;
        items: Array<{
            itemName: string;
            partNumber?: string;
            quantity: number;
            unitCost: number;
            taxPercent: number;
        }>;
    }) {
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

    async getPurchaseOrders(workshopId: string) {
        return this.prisma.purchaseOrder.findMany({
            where: { workshopId },
            include: {
                supplier: true,
                items: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getPurchaseOrder(id: string) {
        const po = await this.prisma.purchaseOrder.findUnique({
            where: { id },
            include: {
                supplier: true,
                items: true,
            },
        });
        if (!po) throw new NotFoundException('Purchase Order not found');
        return po;
    }

    async updatePurchaseOrderStatus(id: string, status: string) {
        return this.prisma.purchaseOrder.update({
            where: { id },
            data: { status },
        });
    }

    // Supplier Ledger
    async getSupplierLedger(supplierId: string) {
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
}
