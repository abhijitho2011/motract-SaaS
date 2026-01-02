import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
export declare class PurchaseService {
    private prisma;
    constructor(prisma: PrismaService);
    createSupplier(data: Prisma.SupplierCreateInput): Promise<{
        id: string;
        name: string;
        mobile: string;
        workshopId: string;
        address: string | null;
        gstin: string | null;
    }>;
    getSuppliers(workshopId: string): Promise<({
        orders: {
            id: string;
            createdAt: Date;
            workshopId: string;
            invoiceNumber: string | null;
            invoiceDate: Date;
            status: string;
            supplierId: string;
            totalAmount: number;
        }[];
    } & {
        id: string;
        name: string;
        mobile: string;
        workshopId: string;
        address: string | null;
        gstin: string | null;
    })[]>;
    getSupplier(id: string): Promise<{
        orders: ({
            items: {
                id: string;
                quantity: number;
                taxPercent: number;
                itemName: string;
                partNumber: string | null;
                unitCost: number;
                total: number;
                orderId: string;
            }[];
        } & {
            id: string;
            createdAt: Date;
            workshopId: string;
            invoiceNumber: string | null;
            invoiceDate: Date;
            status: string;
            supplierId: string;
            totalAmount: number;
        })[];
    } & {
        id: string;
        name: string;
        mobile: string;
        workshopId: string;
        address: string | null;
        gstin: string | null;
    }>;
    getSupplierLedger(id: string): Promise<({
        items: {
            id: string;
            quantity: number;
            taxPercent: number;
            itemName: string;
            partNumber: string | null;
            unitCost: number;
            total: number;
            orderId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        workshopId: string;
        invoiceNumber: string | null;
        invoiceDate: Date;
        status: string;
        supplierId: string;
        totalAmount: number;
    })[]>;
    createPurchaseOrder(data: {
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
    }): Promise<{
        supplier: {
            id: string;
            name: string;
            mobile: string;
            workshopId: string;
            address: string | null;
            gstin: string | null;
        };
        items: {
            id: string;
            quantity: number;
            taxPercent: number;
            itemName: string;
            partNumber: string | null;
            unitCost: number;
            total: number;
            orderId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        workshopId: string;
        invoiceNumber: string | null;
        invoiceDate: Date;
        status: string;
        supplierId: string;
        totalAmount: number;
    }>;
    getPurchaseOrders(workshopId: string): Promise<({
        supplier: {
            id: string;
            name: string;
            mobile: string;
            workshopId: string;
            address: string | null;
            gstin: string | null;
        };
        items: {
            id: string;
            quantity: number;
            taxPercent: number;
            itemName: string;
            partNumber: string | null;
            unitCost: number;
            total: number;
            orderId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        workshopId: string;
        invoiceNumber: string | null;
        invoiceDate: Date;
        status: string;
        supplierId: string;
        totalAmount: number;
    })[]>;
    getPurchaseOrder(id: string): Promise<{
        supplier: {
            id: string;
            name: string;
            mobile: string;
            workshopId: string;
            address: string | null;
            gstin: string | null;
        };
        items: {
            id: string;
            quantity: number;
            taxPercent: number;
            itemName: string;
            partNumber: string | null;
            unitCost: number;
            total: number;
            orderId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        workshopId: string;
        invoiceNumber: string | null;
        invoiceDate: Date;
        status: string;
        supplierId: string;
        totalAmount: number;
    }>;
    updatePurchaseOrderStatus(id: string, status: string): Promise<{
        id: string;
        createdAt: Date;
        workshopId: string;
        invoiceNumber: string | null;
        invoiceDate: Date;
        status: string;
        supplierId: string;
        totalAmount: number;
    }>;
    receivePurchaseOrder(id: string): Promise<{
        supplier: {
            id: string;
            name: string;
            mobile: string;
            workshopId: string;
            address: string | null;
            gstin: string | null;
        };
        items: {
            id: string;
            quantity: number;
            taxPercent: number;
            itemName: string;
            partNumber: string | null;
            unitCost: number;
            total: number;
            orderId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        workshopId: string;
        invoiceNumber: string | null;
        invoiceDate: Date;
        status: string;
        supplierId: string;
        totalAmount: number;
    }>;
}
