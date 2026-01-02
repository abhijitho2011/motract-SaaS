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
            status: string;
            createdAt: string;
            workshopId: string;
            supplierId: string;
            invoiceDate: string;
            invoiceNumber: string | null;
            totalAmount: number;
        }[];
    }[]>;
    getSupplier(id: string): Promise<any>;
    getSupplierLedger(id: string): Promise<{
        supplierId: string;
        totalPurchases: number;
        totalPaid: number;
        outstandingBalance: number;
        transactions: {
            items: {
                id: string;
                quantity: number;
                taxPercent: number;
                orderId: string;
                itemName: string;
                partNumber: string | null;
                unitCost: number;
                total: number;
            }[];
            paid: any;
            balance: number;
            status: string;
            id: string;
            createdAt: string;
            workshopId: string;
            supplierId: string;
            invoiceDate: string;
            invoiceNumber: string | null;
            totalAmount: number;
            payments: {
                date: string;
                id: string;
                mode: "CASH" | "UPI" | "CARD" | "BANK_TRANSFER" | "CREDIT";
                amount: number;
                reference: string | null;
                purchaseId: string;
            }[];
            purchaseItems: {
                id: string;
                quantity: number;
                taxPercent: number;
                orderId: string;
                itemName: string;
                partNumber: string | null;
                unitCost: number;
                total: number;
            }[];
        }[];
    }>;
    recordPayment(data: {
        purchaseId: string;
        amount: number;
        mode: 'CASH' | 'UPI' | 'CARD' | 'BANK_TRANSFER' | 'CREDIT';
        reference?: string;
    }): Promise<{
        date: string;
        id: string;
        mode: "CASH" | "UPI" | "CARD" | "BANK_TRANSFER" | "CREDIT";
        amount: number;
        reference: string | null;
        purchaseId: string;
    }>;
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
