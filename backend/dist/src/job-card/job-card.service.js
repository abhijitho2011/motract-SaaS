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
exports.JobCardService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_provider_1 = require("../drizzle/drizzle.provider");
const node_postgres_1 = require("drizzle-orm/node-postgres");
const schema_1 = require("../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
const crypto = __importStar(require("crypto"));
let JobCardService = class JobCardService {
    db;
    constructor(db) {
        this.db = db;
    }
    async create(data) {
        const vehicle = await this.db.query.vehicles.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.vehicles.id, data.vehicleId),
        });
        if (!vehicle) {
            throw new common_1.NotFoundException('Vehicle not found.');
        }
        let customer = await this.db.query.customers.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.customers.workshopId, data.workshopId), (0, drizzle_orm_1.eq)(schema_1.customers.mobile, data.customerMobile))
        });
        if (customer) {
            const [updated] = await this.db.update(schema_1.customers)
                .set({ name: data.customerName })
                .where((0, drizzle_orm_1.eq)(schema_1.customers.id, customer.id))
                .returning();
            customer = updated;
        }
        else {
            const [created] = await this.db.insert(schema_1.customers).values({
                id: crypto.randomUUID(),
                workshopId: data.workshopId,
                name: data.customerName,
                mobile: data.customerMobile,
                updatedAt: new Date().toISOString(),
            }).returning();
            customer = created;
        }
        const jobCardId = crypto.randomUUID();
        const [jobCard] = await this.db.insert(schema_1.jobCards).values({
            id: jobCardId,
            workshopId: data.workshopId,
            vehicleId: vehicle.id,
            customerId: customer.id,
            advisorId: data.advisorId || null,
            odometer: data.odometer,
            fuelLevel: data.fuelLevel,
            priority: data.priority || 'NORMAL',
            stage: 'CREATED',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }).returning();
        if (data.complaints && data.complaints.length > 0) {
            await this.db.insert(schema_1.jobComplaints).values(data.complaints.map(c => ({
                id: crypto.randomUUID(),
                jobCardId: jobCardId,
                complaint: c,
            })));
        }
        return this.findOne(jobCardId);
    }
    async findAll(workshopId) {
        return this.db.query.jobCards.findMany({
            where: (0, drizzle_orm_1.eq)(schema_1.jobCards.workshopId, workshopId),
            with: {
                vehicle: {
                    with: {
                        variant: { with: { model: { with: { make: true } } } },
                    },
                },
                customer: true,
            },
            orderBy: [(0, drizzle_orm_1.desc)(schema_1.jobCards.updatedAt)],
        });
    }
    async findOne(id) {
        const jobCard = await this.db.query.jobCards.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.jobCards.id, id),
            with: {
                vehicle: {
                    with: {
                        variant: { with: { model: { with: { make: true } } } },
                    },
                },
                customer: true,
                jobComplaints: true,
                jobInspections: true,
                jobItems: true,
                jobParts: { with: { inventoryItem: true } },
            },
        });
        if (!jobCard)
            throw new common_1.NotFoundException('Job Card not found');
        const res = { ...jobCard };
        if (res.jobInspections && res.jobInspections.length > 0) {
            res.inspection = res.jobInspections[0];
        }
        else {
            res.inspection = null;
        }
        res.tasks = res.jobItems;
        res.parts = res.jobParts.map((p) => ({
            ...p,
            item: p.inventoryItem
        }));
        return res;
    }
    async updateStage(id, stage) {
        return this.db.update(schema_1.jobCards)
            .set({ stage })
            .where((0, drizzle_orm_1.eq)(schema_1.jobCards.id, id))
            .returning();
    }
    async saveInspection(jobCardId, data) {
        let inspection = await this.db.query.jobInspections.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.jobInspections.jobCardId, jobCardId)
        });
        const values = {
            exterior: data.exterior,
            interior: data.interior,
            tyres: data.tyres,
            battery: data.battery,
            documents: data.documents,
            photos: data.photos,
        };
        if (inspection) {
            await this.db.update(schema_1.jobInspections)
                .set(values)
                .where((0, drizzle_orm_1.eq)(schema_1.jobInspections.id, inspection.id));
        }
        else {
            await this.db.insert(schema_1.jobInspections).values({
                id: crypto.randomUUID(),
                jobCardId,
                ...values
            });
        }
        await this.db.update(schema_1.jobCards)
            .set({
            fuelLevel: data.fuelLevel,
            odometer: data.odometer,
            stage: 'ESTIMATE'
        })
            .where((0, drizzle_orm_1.eq)(schema_1.jobCards.id, jobCardId));
        return this.findOne(jobCardId);
    }
    async addTask(jobCardId, data) {
        return this.db.insert(schema_1.jobItems).values({
            id: crypto.randomUUID(),
            jobCardId,
            description: data.description,
            price: data.price,
            gstPercent: data.gst,
            isApproved: false,
        }).returning();
    }
    async addPart(jobCardId, data) {
        const [part] = await this.db.insert(schema_1.jobParts).values({
            id: crypto.randomUUID(),
            jobCardId,
            itemId: data.itemId,
            quantity: data.quantity,
            unitPrice: data.unitPrice,
            gstPercent: data.gst,
            totalPrice: data.quantity * data.unitPrice * (1 + data.gst / 100),
            isApproved: false,
        }).returning();
        const p = await this.db.query.jobParts.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.jobParts.id, part.id),
            with: { inventoryItem: true }
        });
        return { ...p, item: p.inventoryItem };
    }
    async assignTechnician(id, technicianId) {
        return this.db.update(schema_1.jobCards)
            .set({ technicianId })
            .where((0, drizzle_orm_1.eq)(schema_1.jobCards.id, id))
            .returning();
    }
    async updateTaskStatus(jobCardId, taskId, status) {
        return this.db.update(schema_1.jobItems)
            .set({ completionStatus: status })
            .where((0, drizzle_orm_1.eq)(schema_1.jobItems.id, taskId))
            .returning();
    }
};
exports.JobCardService = JobCardService;
exports.JobCardService = JobCardService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(drizzle_provider_1.DrizzleAsyncProvider)),
    __metadata("design:paramtypes", [node_postgres_1.NodePgDatabase])
], JobCardService);
//# sourceMappingURL=job-card.service.js.map