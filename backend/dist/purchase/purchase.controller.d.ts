import { PurchaseService } from './purchase.service';
export declare class PurchaseController {
    private readonly purchaseService;
    constructor(purchaseService: PurchaseService);
    createSupplier(data: any): Promise<{
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
    createPurchaseOrder(data: any): Promise<any>;
    getPurchaseOrders(workshopId: string): Promise<any[]>;
    getPurchaseOrder(id: string): Promise<any>;
    updateStatus(id: string, status: string): Promise<{
        id: string;
        workshopId: string;
        supplierId: string;
        invoiceDate: string;
        invoiceNumber: string | null;
        totalAmount: number;
        status: string;
        createdAt: string;
    }[]>;
    receiveOrder(id: string): Promise<any>;
    recordPayment(body: any): Promise<{
        date: string;
        id: string;
        mode: "CASH" | "UPI" | "CARD" | "BANK_TRANSFER" | "CREDIT";
        amount: number;
        reference: string | null;
        purchaseId: string;
    }>;
}
