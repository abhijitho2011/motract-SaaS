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
exports.SlotService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_provider_1 = require("../drizzle/drizzle.provider");
const node_postgres_1 = require("drizzle-orm/node-postgres");
const schema_1 = require("../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
const crypto = __importStar(require("crypto"));
let SlotService = class SlotService {
    db;
    constructor(db) {
        this.db = db;
    }
    async createBay(data) {
        const [bay] = await this.db.insert(schema_1.bays).values({
            id: crypto.randomUUID(),
            workshopId: data.workshopId,
            name: data.name,
            type: data.type,
            isActive: true
        }).returning();
        return bay;
    }
    async findBays(workshopId) {
        return this.db.query.bays.findMany({
            where: (0, drizzle_orm_1.eq)(schema_1.bays.workshopId, workshopId),
            with: { slotBookings: true }
        });
    }
    async bookSlot(data) {
        const [booking] = await this.db.insert(schema_1.slotBookings).values({
            id: crypto.randomUUID(),
            bayId: data.bayId,
            date: data.date,
            startTime: data.startTime,
            endTime: data.endTime,
            status: 'BOOKED',
            jobCardId: data.jobCardId || null,
        }).returning();
        return booking;
    }
    async updateBay(id, data) {
        const [updated] = await this.db.update(schema_1.bays)
            .set({
            name: data.name,
            type: data.type,
            isActive: data.isActive,
        })
            .where((0, drizzle_orm_1.eq)(schema_1.bays.id, id))
            .returning();
        return updated;
    }
    async deleteBay(id, workshopId) {
        const bay = await this.db.query.bays.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.bays.id, id), (0, drizzle_orm_1.eq)(schema_1.bays.workshopId, workshopId)),
        });
        if (!bay) {
            throw new common_1.NotFoundException('Bay not found or access denied');
        }
        await this.db.delete(schema_1.bays).where((0, drizzle_orm_1.eq)(schema_1.bays.id, id));
        return { message: 'Bay deleted successfully' };
    }
};
exports.SlotService = SlotService;
exports.SlotService = SlotService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(drizzle_provider_1.DrizzleAsyncProvider)),
    __metadata("design:paramtypes", [node_postgres_1.NodePgDatabase])
], SlotService);
//# sourceMappingURL=slot.service.js.map