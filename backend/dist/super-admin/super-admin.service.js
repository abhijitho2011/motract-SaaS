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
exports.SuperAdminService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_provider_1 = require("../drizzle/drizzle.provider");
const node_postgres_1 = require("drizzle-orm/node-postgres");
const schema_1 = require("../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
const crypto = __importStar(require("crypto"));
const bcrypt = __importStar(require("bcrypt"));
let SuperAdminService = class SuperAdminService {
    db;
    constructor(db) {
        this.db = db;
    }
    async createOrganization(data) {
        const isAuthorized = data.accountType === 'RSA' ? true : (data.isAuthorized || false);
        const [organization] = await this.db.insert(schema_1.organizations).values({
            id: crypto.randomUUID(),
            accountType: data.accountType,
            subCategory: data.subCategory,
            businessName: data.businessName,
            name: data.businessName,
            email: data.email,
            phone: data.phone,
            address: data.address,
            city: data.city,
            state: data.state,
            pincode: data.pincode,
            gstin: data.gstin,
            latitude: data.latitude,
            longitude: data.longitude,
            isAuthorized,
            isActive: true,
            createdBy: data.createdBy,
            updatedAt: new Date().toISOString(),
        }).returning();
        const hashedPassword = await bcrypt.hash(data.adminUser.password, 10);
        const [adminUser] = await this.db.insert(schema_1.users).values({
            id: crypto.randomUUID(),
            email: data.adminUser.email,
            mobile: data.phone,
            password: hashedPassword,
            name: data.adminUser.name,
            role: data.accountType === 'WORKSHOP' ? 'WORKSHOP_ADMIN' :
                data.accountType === 'RSA' ? 'RSA_PROVIDER' : 'SUPPLIER',
            workshopId: organization.id,
            updatedAt: new Date().toISOString(),
        }).returning();
        return { organization, adminUser: { ...adminUser, password: undefined } };
    }
    async getAllOrganizations(filters) {
        const allOrgs = await this.db.query.organizations.findMany({
            orderBy: [(0, drizzle_orm_1.desc)(schema_1.organizations.createdAt)],
        });
        let filtered = allOrgs;
        if (filters?.accountType) {
            filtered = filtered.filter(o => o.accountType === filters.accountType);
        }
        if (filters?.isAuthorized !== undefined) {
            filtered = filtered.filter(o => o.isAuthorized === filters.isAuthorized);
        }
        if (filters?.isActive !== undefined) {
            filtered = filtered.filter(o => o.isActive === filters.isActive);
        }
        return filtered;
    }
    async getOrganizationById(id) {
        const org = await this.db.query.organizations.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.organizations.id, id),
        });
        if (!org) {
            throw new common_1.NotFoundException('Organization not found');
        }
        return org;
    }
    async updateOrganization(id, data) {
        const updateData = { ...data, updatedAt: new Date().toISOString() };
        if (data.businessName) {
            updateData.name = data.businessName;
        }
        const [updated] = await this.db.update(schema_1.organizations)
            .set(updateData)
            .where((0, drizzle_orm_1.eq)(schema_1.organizations.id, id))
            .returning();
        if (!updated) {
            throw new common_1.NotFoundException('Organization not found');
        }
        return updated;
    }
    async deleteOrganization(id) {
        const [deleted] = await this.db.delete(schema_1.organizations)
            .where((0, drizzle_orm_1.eq)(schema_1.organizations.id, id))
            .returning();
        if (!deleted) {
            throw new common_1.NotFoundException('Organization not found');
        }
        return { message: 'Organization deleted successfully' };
    }
    async getMapData(filters) {
        let orgs = await this.db.query.organizations.findMany({
            where: (0, drizzle_orm_1.eq)(schema_1.organizations.isActive, true),
        });
        if (filters?.accountType) {
            orgs = orgs.filter(o => o.accountType === filters.accountType);
        }
        return orgs.filter(o => o.latitude && o.longitude);
    }
    async getAllCategories() {
        return this.db.query.serviceCategories.findMany({
            orderBy: [(0, drizzle_orm_1.asc)(schema_1.serviceCategories.name)],
        });
    }
    async createCategory(data) {
        const [category] = await this.db.insert(schema_1.serviceCategories).values({
            id: crypto.randomUUID(),
            name: data.name,
            description: data.description,
            canHaveSubCategories: data.canHaveSubCategories || false,
        }).returning();
        return category;
    }
    async updateCategory(id, data) {
        const [updated] = await this.db.update(schema_1.serviceCategories)
            .set(data)
            .where((0, drizzle_orm_1.eq)(schema_1.serviceCategories.id, id))
            .returning();
        if (!updated) {
            throw new common_1.NotFoundException('Category not found');
        }
        return updated;
    }
    async deleteCategory(id) {
        const [deleted] = await this.db.delete(schema_1.serviceCategories)
            .where((0, drizzle_orm_1.eq)(schema_1.serviceCategories.id, id))
            .returning();
        if (!deleted) {
            throw new common_1.NotFoundException('Category not found');
        }
        return { message: 'Category deleted successfully' };
    }
    async getSubCategories(categoryId) {
        return this.db.query.serviceSubCategories.findMany({
            where: (0, drizzle_orm_1.eq)(schema_1.serviceSubCategories.categoryId, categoryId),
            orderBy: [(0, drizzle_orm_1.asc)(schema_1.serviceSubCategories.name)],
        });
    }
    async createSubCategory(categoryId, data) {
        const [subCategory] = await this.db.insert(schema_1.serviceSubCategories).values({
            id: crypto.randomUUID(),
            categoryId,
            name: data.name,
            description: data.description,
        }).returning();
        return subCategory;
    }
    async getAuthorizedOrganizations() {
        return this.db.query.organizations.findMany({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.organizations.isAuthorized, true), (0, drizzle_orm_1.eq)(schema_1.organizations.isActive, true)),
            orderBy: [(0, drizzle_orm_1.asc)(schema_1.organizations.businessName)],
        });
    }
    async getRSAOrganizations() {
        return this.db.query.organizations.findMany({
            where: (0, drizzle_orm_1.eq)(schema_1.organizations.accountType, 'RSA'),
            orderBy: [(0, drizzle_orm_1.asc)(schema_1.organizations.businessName)],
        });
    }
    async getAllBookings(filters) {
        const allBookings = await this.db.query.onlineBookings.findMany({
            orderBy: [(0, drizzle_orm_1.desc)(schema_1.onlineBookings.createdAt)],
        });
        let filtered = allBookings;
        if (filters?.organizationId) {
            filtered = filtered.filter(b => b.organizationId === filters.organizationId);
        }
        if (filters?.status) {
            filtered = filtered.filter(b => b.status === filters.status);
        }
        return filtered;
    }
    async getDashboardStats() {
        const allOrgs = await this.db.query.organizations.findMany();
        const allBookings = await this.db.query.onlineBookings.findMany();
        const stats = {
            totalOrganizations: allOrgs.length,
            byType: {
                workshop: allOrgs.filter(o => o.accountType === 'WORKSHOP').length,
                supplier: allOrgs.filter(o => o.accountType === 'SUPPLIER').length,
                rsa: allOrgs.filter(o => o.accountType === 'RSA').length,
                rebuildCenter: allOrgs.filter(o => o.accountType === 'REBUILD_CENTER').length,
            },
            authorized: allOrgs.filter(o => o.isAuthorized).length,
            active: allOrgs.filter(o => o.isActive).length,
            bookings: {
                total: allBookings.length,
                pending: allBookings.filter(b => b.status === 'PENDING').length,
                confirmed: allBookings.filter(b => b.status === 'CONFIRMED').length,
                completed: allBookings.filter(b => b.status === 'COMPLETED').length,
            },
        };
        return stats;
    }
};
exports.SuperAdminService = SuperAdminService;
exports.SuperAdminService = SuperAdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(drizzle_provider_1.DrizzleAsyncProvider)),
    __metadata("design:paramtypes", [node_postgres_1.NodePgDatabase])
], SuperAdminService);
//# sourceMappingURL=super-admin.service.js.map