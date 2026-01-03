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
}
