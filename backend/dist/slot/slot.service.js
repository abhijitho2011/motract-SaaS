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
    async setWorkingHours(workshopId, hours) {
        await this.db.delete(schema_1.workshopWorkingHours).where((0, drizzle_orm_1.eq)(schema_1.workshopWorkingHours.workshopId, workshopId));
        if (hours.length > 0) {
            await this.db.insert(schema_1.workshopWorkingHours).values(hours.map(h => ({
                id: crypto.randomUUID(),
                workshopId,
                ...h
            })));
        }
        return this.getWorkingHours(workshopId);
    }
    async getWorkingHours(workshopId) {
        return this.db.select().from(schema_1.workshopWorkingHours).where((0, drizzle_orm_1.eq)(schema_1.workshopWorkingHours.workshopId, workshopId));
    }
    async setBreaks(workshopId, breaksList) {
        await this.db.delete(schema_1.workshopBreaks).where((0, drizzle_orm_1.eq)(schema_1.workshopBreaks.workshopId, workshopId));
        if (breaksList.length > 0) {
            await this.db.insert(schema_1.workshopBreaks).values(breaksList.map(b => ({
                id: crypto.randomUUID(),
                workshopId,
                title: b.title,
                startTime: b.startTime,
                endTime: b.endTime
            })));
        }
        return this.getBreaks(workshopId);
    }
    async getBreaks(workshopId) {
        return this.db.select().from(schema_1.workshopBreaks).where((0, drizzle_orm_1.eq)(schema_1.workshopBreaks.workshopId, workshopId));
    }
    async createBay(data) {
        const [result] = await this.db.insert(schema_1.bays).values({
            id: crypto.randomUUID(),
            workshopId: data.workshopId,
            name: data.name,
            type: data.type,
            isActive: true,
        }).returning();
        return result;
    }
    async findBays(workshopId) {
        return this.db.query.bays.findMany({
            where: (0, drizzle_orm_1.eq)(schema_1.bays.workshopId, workshopId),
            with: { serviceBayMappings: { with: { service: true } } },
        });
    }
    async mapServiceToBay(bayId, serviceId) {
        return this.db.insert(schema_1.serviceBayMapping).values({
            id: crypto.randomUUID(),
            bayId,
            serviceId,
        }).onConflictDoNothing()
            .returning();
    }
    async getAvailableSlots(workshopId, date, serviceId) {
        const service = await this.db.query.services.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.services.id, serviceId)
        });
        if (!service)
            throw new common_1.NotFoundException('Service not found');
        const durationCount = service.durationMin || 30;
        const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
        const wh = await this.db.query.workshopWorkingHours.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.workshopWorkingHours.workshopId, workshopId), (0, drizzle_orm_1.eq)(schema_1.workshopWorkingHours.dayOfWeek, dayName))
        });
        if (!wh)
            return [];
        const breaks = await this.db.query.workshopBreaks.findMany({
            where: (0, drizzle_orm_1.eq)(schema_1.workshopBreaks.workshopId, workshopId)
        });
        const timeToMin = (t) => {
            const [h, m] = t.split(':').map(Number);
            return h * 60 + m;
        };
        const minToTime = (min) => {
            const h = Math.floor(min / 60).toString().padStart(2, '0');
            const m = (min % 60).toString().padStart(2, '0');
            return `${h}:${m}`;
        };
        const openMin = timeToMin(wh.openingTime);
        const closeMin = timeToMin(wh.closingTime);
        const generatedSlots = [];
        const mappedBays = await this.db.query.serviceBayMapping.findMany({
            where: (0, drizzle_orm_1.eq)(schema_1.serviceBayMapping.serviceId, serviceId),
            columns: { bayId: true }
        });
        const bayIds = mappedBays.map(m => m.bayId);
        if (bayIds.length === 0)
            return [];
        const bookings = await this.db.query.slotBookings.findMany({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.inArray)(schema_1.slotBookings.bayId, bayIds), (0, drizzle_orm_1.eq)(schema_1.slotBookings.date, date))
        });
        const blocks = await this.db.query.slotBlocks.findMany({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.slotBlocks.workshopId, workshopId))
        });
        let current = openMin;
        while (current + durationCount <= closeMin) {
            const start = current;
            const end = current + durationCount;
            const startStr = minToTime(start);
            const endStr = minToTime(end);
            const inBreak = breaks.some(b => {
                const bStart = timeToMin(b.startTime);
                const bEnd = timeToMin(b.endTime);
                return !(end <= bStart || start >= bEnd);
            });
            if (inBreak) {
                current += 30;
                continue;
            }
            let occupied = 0;
            bookings.forEach(bk => {
                const bkStart = timeToMin(bk.startTime);
                const bkEnd = timeToMin(bk.endTime);
                if (!(end <= bkStart || start >= bkEnd)) {
                    occupied++;
                }
            });
            let freeBays = 0;
            for (const bayId of bayIds) {
                let isBayFree = true;
                const bayBooking = bookings.find(bk => bk.bayId === bayId && !(end <= timeToMin(bk.startTime) || start >= timeToMin(bk.endTime)));
                if (bayBooking)
                    isBayFree = false;
                if (isBayFree) {
                    const slotDateStart = new Date(`${date}T${startStr}:00`);
                    const slotDateEnd = new Date(`${date}T${endStr}:00`);
                    const bayBlock = blocks.find(blk => {
                        if (blk.bayId && blk.bayId !== bayId)
                            return false;
                        const blkStart = new Date(blk.startTime);
                        const blkEnd = new Date(blk.endTime);
                        return (slotDateStart < blkEnd && slotDateEnd > blkStart);
                    });
                    if (bayBlock)
                        isBayFree = false;
                }
                if (isBayFree)
                    freeBays++;
            }
            generatedSlots.push({
                startTime: startStr,
                endTime: endStr,
                status: freeBays > 0 ? 'AVAILABLE' : 'BOOKED',
                availableBays: freeBays
            });
            current += 30;
        }
        return generatedSlots;
    }
    async bookSlot(data) {
        return this.db.transaction(async (tx) => {
            const service = await tx.query.services.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.services.id, data.serviceId) });
            if (!service)
                throw new common_1.BadRequestException('Service Invalid');
            const duration = service.durationMin || 30;
            const candidates = await tx.query.serviceBayMapping.findMany({
                where: (0, drizzle_orm_1.eq)(schema_1.serviceBayMapping.serviceId, data.serviceId),
                columns: { bayId: true }
            });
            if (candidates.length === 0)
                throw new common_1.BadRequestException('No bays for this service');
            const candidateIds = candidates.map(c => c.bayId);
            const [h, m] = data.startTime.split(':').map(Number);
            const startMin = h * 60 + m;
            const endMin = startMin + duration;
            const endTimeStr = `${Math.floor(endMin / 60).toString().padStart(2, '0')}:${(endMin % 60).toString().padStart(2, '0')}`;
            const collisions = await tx.query.slotBookings.findMany({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.slotBookings.date, data.date), (0, drizzle_orm_1.inArray)(schema_1.slotBookings.bayId, candidateIds))
            });
            let selectedBayId = null;
            for (const cid of candidateIds) {
                const hasCollision = collisions.some(col => {
                    if (col.bayId !== cid)
                        return false;
                    const cStart = this.parseMin(col.startTime);
                    const cEnd = this.parseMin(col.endTime);
                    return !(endMin <= cStart || startMin >= cEnd);
                });
                if (!hasCollision) {
                    selectedBayId = cid;
                    break;
                }
            }
            if (!selectedBayId)
                throw new common_1.BadRequestException('Slot already booked');
            const [booking] = await tx.insert(schema_1.slotBookings).values({
                id: crypto.randomUUID(),
                bayId: selectedBayId,
                date: data.date,
                startTime: data.startTime,
                endTime: endTimeStr,
                status: 'BOOKED',
                jobCardId: data.jobCardId
            }).returning();
            return booking;
        });
    }
    parseMin(t) {
        const [h, m] = t.split(':').map(Number);
        return h * 60 + m;
    }
};
exports.SlotService = SlotService;
exports.SlotService = SlotService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(drizzle_provider_1.DrizzleAsyncProvider)),
    __metadata("design:paramtypes", [node_postgres_1.NodePgDatabase])
], SlotService);
//# sourceMappingURL=slot.service.js.map