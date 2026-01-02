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
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_provider_1 = require("../drizzle/drizzle.provider");
const node_postgres_1 = require("drizzle-orm/node-postgres");
const schema_1 = require("../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
const crypto = __importStar(require("crypto"));
let InventoryService = class InventoryService {
    db;
    constructor(db) {
        this.db = db;
    }
    async createItem(data) {
        const [item] = await this.db.insert(schema_1.inventoryItems).values(data).returning();
        return { ...item, partNumbers: [], batches: [] };
    }
    async addSku(itemId, skuCode) {
        return this.db.insert(schema_1.inventoryPartNumbers).values({
            id: crypto.randomUUID(),
            itemId,
            skuCode
        }).returning();
    }
    async addBatch(itemId, data) {
        return this.db.insert(schema_1.inventoryBatches).values({
            id: crypto.randomUUID(),
            itemId,
            quantity: data.quantity,
            purchasePrice: data.purchasePrice,
            salePrice: data.salePrice,
            batchNumber: data.batchNumber,
            expiryDate: data.expiryDate ? data.expiryDate.toISOString() : null,
        }).returning();
    }
    async findAll(workshopId) {
        return this.db.query.inventoryItems.findMany({
            where: (0, drizzle_orm_1.eq)(schema_1.inventoryItems.workshopId, workshopId),
            with: { inventoryPartNumbers: true, inventoryBatches: true },
        });
    }
    async findOne(id) {
        const item = await this.db.query.inventoryItems.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.inventoryItems.id, id),
            with: {
                inventoryPartNumbers: true,
                inventoryBatches: true,
                inventoryVehicleMappings: { with: { model: true } },
            },
        });
        if (!item)
            throw new common_1.NotFoundException('Item not found');
        const res = { ...item };
        res.partNumbers = res.inventoryPartNumbers;
        res.batches = res.inventoryBatches;
        res.compatibleVehicles = res.inventoryVehicleMappings;
        delete res.inventoryPartNumbers;
        delete res.inventoryBatches;
        delete res.inventoryVehicleMappings;
        return res;
    }
    async addCompatibility(itemId, modelId, variantId) {
        const [mapping] = await this.db.insert(schema_1.inventoryVehicleMapping).values({
            id: crypto.randomUUID(),
            itemId,
            modelId,
            variantId
        }).returning();
        const res = await this.db.query.inventoryVehicleMapping.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.inventoryVehicleMapping.id, mapping.id),
            with: { model: true }
        });
        return res;
    }
    async getCompatibility(itemId) {
        return this.db.query.inventoryVehicleMapping.findMany({
            where: (0, drizzle_orm_1.eq)(schema_1.inventoryVehicleMapping.itemId, itemId),
            with: { model: true },
        });
    }
    async adjustStock(itemId, quantity, reason) {
        if (quantity === 0)
            return this.findOne(itemId);
        if (quantity > 0) {
            await this.db.insert(schema_1.inventoryBatches).values({
                id: crypto.randomUUID(),
                itemId,
                batchNumber: `ADJ-${Date.now()}`,
                quantity: quantity,
                purchasePrice: 0,
                salePrice: 0,
            });
        }
        else {
            const deduction = Math.abs(quantity);
            let remaining = deduction;
            const batches = await this.db.query.inventoryBatches.findMany({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.inventoryBatches.itemId, itemId), (0, drizzle_orm_1.gt)(schema_1.inventoryBatches.quantity, 0)),
                orderBy: [(0, drizzle_orm_1.asc)(schema_1.inventoryBatches.expiryDate), (0, drizzle_orm_1.asc)(schema_1.inventoryBatches.purchasedAt)],
            });
            for (const batch of batches) {
                if (remaining <= 0)
                    break;
                const batchQty = batch.quantity;
                const take = Math.min(batchQty, remaining);
                await this.db.update(schema_1.inventoryBatches)
                    .set({ quantity: batchQty - take })
                    .where((0, drizzle_orm_1.eq)(schema_1.inventoryBatches.id, batch.id));
                remaining -= take;
            }
            if (remaining > 0) {
                throw new common_1.BadRequestException('Not enough stock to reduce');
            }
        }
        return this.findOne(itemId);
    }
    async getExpiringBatches(workshopId, daysThreshold = 30) {
        const thresholdDate = new Date();
        thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);
        const thresholdStr = thresholdDate.toISOString();
        const todayStr = new Date().toISOString();
        const res = await this.db.select({
            batch: schema_1.inventoryBatches,
            item: schema_1.inventoryItems
        })
            .from(schema_1.inventoryBatches)
            .innerJoin(schema_1.inventoryItems, (0, drizzle_orm_1.eq)(schema_1.inventoryBatches.itemId, schema_1.inventoryItems.id))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.inventoryItems.workshopId, workshopId), (0, drizzle_orm_1.gt)(schema_1.inventoryBatches.quantity, 0), (0, drizzle_orm_1.lte)(schema_1.inventoryBatches.expiryDate, thresholdStr), (0, drizzle_orm_1.gte)(schema_1.inventoryBatches.expiryDate, todayStr)));
        return res;
    }
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(drizzle_provider_1.DrizzleAsyncProvider)),
    __metadata("design:paramtypes", [node_postgres_1.NodePgDatabase])
], InventoryService);
//# sourceMappingURL=inventory.service.js.map