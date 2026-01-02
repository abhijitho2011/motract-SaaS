import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../drizzle/schema';
import { suppliers } from '../drizzle/schema';
export declare class PurchaseService {
    private db;
    constructor(db: NodePgDatabase<typeof schema>);
    createSupplier(data: typeof suppliers.$inferInsert): Promise<{
        id: string;
        name: string;
        mobile: string;
        workshopId: string;
        address: string | null;
        gstin: string | null;
    }>;
    getSuppliers(workshopId: string): Promise<{
        id: string;
        name: string;
        mobile: string;
        workshopId: string;
        address: string | null;
        gstin: string | null;
        purchases: {
            id: string;
            createdAt: string;
            workshopId: string;
            supplierId: string;
            invoiceDate: string;
            invoiceNumber: string | null;
            totalAmount: number;
            status: string;
        }[];
    }[]>;
    getSupplier(id: string): Promise<any>;
    getSupplierLedger(id: string): Promise<any[]>;
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
    }): Promise<any>;
    getPurchaseOrders(workshopId: string): Promise<any[]>;
    getPurchaseOrder(id: string): Promise<any>;
    updatePurchaseOrderStatus(id: string, status: string): Promise<{
        id: string;
        workshopId: string;
        supplierId: string;
        invoiceDate: string;
        invoiceNumber: string | null;
        totalAmount: number;
        status: string;
        createdAt: string;
    }[]>;
    receivePurchaseOrder(id: string): Promise<any>;
}
