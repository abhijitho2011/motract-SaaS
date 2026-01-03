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
exports.VehicleService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_provider_1 = require("../drizzle/drizzle.provider");
const node_postgres_1 = require("drizzle-orm/node-postgres");
const schema = __importStar(require("../drizzle/schema"));
const schema_1 = require("../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
const crypto = __importStar(require("crypto"));
let VehicleService = class VehicleService {
    db;
    constructor(db) {
        this.db = db;
    }
    async lookup(regNumber) {
        const vehicle = await this.db.query.vehicles.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.vehicles.regNumber, regNumber),
            with: {
                variant: {
                    with: {
                        model: {
                            with: {
                                make: true,
                            },
                        },
                    },
                },
            },
        });
        return vehicle || null;
    }
    async register(data) {
        const { regNumber, make, model, variant, engineNumber, chassisNumber, vin, year, } = data;
        const [makeRecord] = await this.db
            .insert(schema_1.makes)
            .values({
            id: crypto.randomUUID(),
            name: make
        })
            .onConflictDoUpdate({
            target: schema_1.makes.name,
            set: { name: make }
        })
            .returning();
        const [modelRecord] = await this.db
            .insert(schema_1.models)
            .values({
            id: crypto.randomUUID(),
            name: model,
            makeId: makeRecord.id,
        })
            .onConflictDoUpdate({
            target: schema_1.models.name,
            set: { name: model }
        })
            .returning();
        let existingModel = await this.db.query.models.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.models.makeId, makeRecord.id), (0, drizzle_orm_1.eq)(schema_1.models.name, model))
        });
        if (!existingModel) {
            const res = await this.db.insert(schema_1.models).values({
                id: crypto.randomUUID(),
                name: model,
                makeId: makeRecord.id,
            }).returning();
            existingModel = res[0];
        }
        const modelId = existingModel.id;
        let existingVariant = await this.db.query.variants.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.variants.modelId, modelId), (0, drizzle_orm_1.eq)(schema_1.variants.name, variant), (0, drizzle_orm_1.eq)(schema_1.variants.fuelType, 'PETROL'))
        });
        if (!existingVariant) {
            const res = await this.db.insert(schema_1.variants).values({
                id: crypto.randomUUID(),
                name: variant,
                modelId: modelId,
                fuelType: 'PETROL'
            }).returning();
            existingVariant = res[0];
        }
        const variantId = existingVariant.id;
        const [vehicle] = await this.db.insert(schema_1.vehicles).values({
            id: crypto.randomUUID(),
            regNumber,
            engineNumber,
            chassisNumber,
            vin,
            mfgYear: year,
            variantId: variantId,
            updatedAt: new Date().toISOString(),
        }).returning();
        return vehicle;
    }
    async createMake(name) {
        const [make] = await this.db.insert(schema.makes).values({
            id: crypto.randomUUID(),
            name,
        }).returning();
        return make;
    }
    async createModel(makeId, name) {
        const [model] = await this.db.insert(schema.models).values({
            id: crypto.randomUUID(),
            makeId,
            name,
        }).returning();
        return model;
    }
    async createVariant(modelId, name, fuelType) {
        const [variant] = await this.db.insert(schema.variants).values({
            id: crypto.randomUUID(),
            modelId,
            name,
            fuelType,
        }).returning();
        return variant;
    }
    async findAllModels() {
        return this.db.query.models.findMany({
            with: { make: true, variants: true },
        });
    }
};
exports.VehicleService = VehicleService;
exports.VehicleService = VehicleService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(drizzle_provider_1.DrizzleAsyncProvider)),
    __metadata("design:paramtypes", [node_postgres_1.NodePgDatabase])
], VehicleService);
//# sourceMappingURL=vehicle.service.js.map