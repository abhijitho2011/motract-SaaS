"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchaseService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_provider_1 = require("../drizzle/drizzle.provider");
const node_postgres_1 = require("drizzle-orm/node-postgres");
const schema_1 = require("../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
const crypto = __importStar(require("crypto"));
let PurchaseService = class PurchaseService {
    db;
    constructor(db) {
        this.db = db;
    }
    async createSupplier(data) {
        const [supplier] = await this.db.insert(schema_1.suppliers).values({
            ...data,
            id: crypto.randomUUID(),
        }).returning();
        return supplier;
    }
    async getSuppliers(workshopId) {
        return this.db.query.suppliers.findMany({
            where: (0, drizzle_orm_1.eq)(schema_1.suppliers.workshopId, workshopId),
            with: {
                purchases: {
                    orderBy: [(0, drizzle_orm_1.desc)(schema_1.purchases.createdAt)],
                    limit: 5,
                },
            },
        });
    }
    async getSupplier(id) {
        const supplier = await this.db.query.suppliers.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.suppliers.id, id),
            with: {
                purchases: {
                    with: { purchaseItems: true },
                    orderBy: [(0, drizzle_orm_1.desc)(schema_1.purchases.createdAt)],
                },
            },
        });
        if (!supplier)
            throw new common_1.NotFoundException('Supplier not found');
        const res = { ...supplier };
        res.orders = res.purchases;
        delete res.purchases;
        res.orders.forEach((o) => {
            o.items = o.purchaseItems;
            delete o.purchaseItems;
        });
        return res;
    }
    async getSupplierLedger(id) {
        const orders = await this.db.query.purchases.findMany({
            where: (0, drizzle_orm_1.eq)(schema_1.purchases.supplierId, id),
            orderBy: [(0, drizzle_orm_1.desc)(schema_1.purchases.createdAt)],
            with: {
                purchaseItems: true,
                payments: true,
            },
        });
        let totalPurchases = 0;
        let totalPaid = 0;
        const transactions = orders.map((o) => {
            const orderTotal = o.totalAmount;
            const orderPaid = o.payments.reduce((sum, p) => sum + p.amount, 0);
            totalPurchases += orderTotal;
            totalPaid += orderPaid;
            return {
                ...o,
                items: o.purchaseItems,
                paid: orderPaid,
                balance: orderTotal - orderPaid,
                status: orderTotal === orderPaid ? 'PAID' : (orderPaid > 0 ? 'PARTIAL' : o.status)
            };
        });
        return {
            supplierId: id,
            totalPurchases,
            totalPaid,
            outstandingBalance: totalPurchases - totalPaid,
            transactions,
        };
    }
    async recordPayment(data) {
        const order = await this.db.query.purchases.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.purchases.id, data.purchaseId),
        });
        if (!order)
            throw new common_1.NotFoundException('Purchase Order not found');
        const [payment] = await this.db.insert(schema_1.purchasePayments).values({
            id: crypto.randomUUID(),
            purchaseId: data.purchaseId,
            amount: data.amount,
            mode: data.mode,
            reference: data.reference,
            date: new Date().toISOString(),
        }).returning();
        return payment;
    }
    async createPurchaseOrder(data) {
        const totalAmount = data.items.reduce((sum, item) => {
            const itemTotal = item.quantity * item.unitCost;
            const tax = itemTotal * (item.taxPercent / 100);
            return sum + itemTotal + tax;
        }, 0);
        return await this.db.transaction(async (tx) => {
            const [po] = await tx.insert(schema_1.purchases).values({
                id: crypto.randomUUID(),
                workshopId: data.workshopId,
                supplierId: data.supplierId,
                invoiceDate: data.invoiceDate.toISOString(),
                invoiceNumber: data.invoiceNumber,
                totalAmount,
                status: 'DRAFT',
            }).returning();
            if (data.items.length > 0) {
                await tx.insert(schema_1.purchaseItems).values(data.items.map((item) => ({
                    id: crypto.randomUUID(),
                    orderId: po.id,
                    itemName: item.itemName,
                    partNumber: item.partNumber,
                    quantity: item.quantity,
                    unitCost: item.unitCost,
                    taxPercent: item.taxPercent,
                    total: item.quantity * item.unitCost * (1 + item.taxPercent / 100),
                })));
            }
            const fullPo = await tx.query.purchases.findFirst({
                where: (0, drizzle_orm_1.eq)(schema_1.purchases.id, po.id),
                with: { purchaseItems: true, supplier: true }
            });
            const res = { ...fullPo };
            res.items = res.purchaseItems;
            delete res.purchaseItems;
            return res;
        });
    }
    async getPurchaseOrders(workshopId) {
        const orders = await this.db.query.purchases.findMany({
            where: (0, drizzle_orm_1.eq)(schema_1.purchases.workshopId, workshopId),
            with: {
                supplier: true,
                purchaseItems: true,
            },
            orderBy: [(0, drizzle_orm_1.desc)(schema_1.purchases.createdAt)],
        });
        return orders.map((o) => ({ ...o, items: o.purchaseItems }));
    }
    async getPurchaseOrder(id) {
        const po = await this.db.query.purchases.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.purchases.id, id),
            with: {
                supplier: true,
                purchaseItems: true,
            },
        });
        if (!po)
            throw new common_1.NotFoundException('Purchase Order not found');
        const res = { ...po };
        res.items = res.purchaseItems;
        delete res.purchaseItems;
        return res;
    }
    async updatePurchaseOrderStatus(id, status) {
        return this.db.update(schema_1.purchases)
            .set({ status })
            .where((0, drizzle_orm_1.eq)(schema_1.purchases.id, id))
            .returning();
    }
    async receivePurchaseOrder(id) {
        const po = await this.db.query.purchases.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.purchases.id, id),
            with: { purchaseItems: true },
        });
        if (!po)
            throw new common_1.NotFoundException('PO not found');
        if (po.status === 'RECEIVED')
            throw new Error('PO already received');
        await this.db.transaction(async (tx) => {
            for (const item of po.purchaseItems) {
                let invItem = await tx.query.inventoryItems.findFirst({
                    where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.inventoryItems.workshopId, po.workshopId), (0, drizzle_orm_1.ilike)(schema_1.inventoryItems.name, item.itemName)),
                });
                if (!invItem) {
                    const [created] = await tx.insert(schema_1.inventoryItems).values({
                        id: crypto.randomUUID(),
                        workshopId: po.workshopId,
                        name: item.itemName,
                        brand: 'Generic',
                        hsnCode: '0000',
                        taxPercent: item.taxPercent,
                        updatedAt: new Date().toISOString(),
                    }).returning();
                    invItem = created;
                }
                await tx.insert(schema_1.inventoryBatches).values({
                    id: crypto.randomUUID(),
                    itemId: invItem.id,
                    batchNumber: `PO-${po.invoiceNumber ?? po.id.substring(0, 4)}`,
                    quantity: item.quantity,
                    purchasePrice: item.total / item.quantity,
                    salePrice: (item.total / item.quantity) * 1.5,
                });
            }
            await tx.update(schema_1.purchases)
                .set({ status: 'RECEIVED' })
                .where((0, drizzle_orm_1.eq)(schema_1.purchases.id, id));
        });
        return this.getPurchaseOrder(id);
    }
};
exports.PurchaseService = PurchaseService;
exports.PurchaseService = PurchaseService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(drizzle_provider_1.DrizzleAsyncProvider)),
    __metadata("design:paramtypes", [node_postgres_1.NodePgDatabase])
], PurchaseService);
//# sourceMappingURL=purchase.service.js.map