"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MasterDataService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_provider_1 = require("../drizzle/drizzle.provider");
const node_postgres_1 = require("drizzle-orm/node-postgres");
const schema_1 = require("../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
let MasterDataService = class MasterDataService {
    db;
    constructor(db) {
        this.db = db;
    }
    async getBrands() {
        return this.db.select().from(schema_1.brands);
    }
    async createBrand(data) {
        return this.db.insert(schema_1.brands).values({
            id: data.id,
            name: data.name,
            type: data.type,
            status: true,
        }).returning();
    }
    async updateBrand(id, data) {
        return this.db.update(schema_1.brands).set(data).where((0, drizzle_orm_1.eq)(schema_1.brands.id, id)).returning();
    }
    async getCategories() {
        return this.db.query.categories.findMany({
            with: {
                subCategories: true
            }
        });
    }
    async createCategory(data) {
        return this.db.insert(schema_1.categories).values(data).returning();
    }
    async createSubCategory(data) {
        return this.db.insert(schema_1.subCategories).values(data).returning();
    }
};
exports.MasterDataService = MasterDataService;
exports.MasterDataService = MasterDataService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(drizzle_provider_1.DrizzleAsyncProvider)),
    __metadata("design:paramtypes", [node_postgres_1.NodePgDatabase])
], MasterDataService);
//# sourceMappingURL=master-data.service.js.map