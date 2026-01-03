import { PurchaseService } from './purchase.service';
export declare class PurchaseController {
    private readonly purchaseService;
    constructor(purchaseService: PurchaseService);
    createSupplier(req: any, data: any): Promise<{
        id: string;
        name: string;
        mobile: string;
        workshopId: string;
        address: string | null;
        gstin: string | null;
    }>;
    getSuppliers(req: any): Promise<{
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
            status: string;
            supplierId: string;
            invoiceDate: string;
            invoiceNumber: string | null;
            totalAmount: number;
        }[];
    }[]>;
    getSupplier(id: string): Promise<any>;
    getSupplierLedger(id: string): Promise<any[]>;
    createPurchaseOrder(req: any, data: any): Promise<any>;
    getPurchaseOrders(req: any): Promise<any[]>;
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
