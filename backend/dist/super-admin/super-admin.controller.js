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
exports.SuperAdminController = void 0;
const common_1 = require("@nestjs/common");
const super_admin_service_1 = require("./super-admin.service");
let SuperAdminController = class SuperAdminController {
    superAdminService;
    constructor(superAdminService) {
        this.superAdminService = superAdminService;
    }
    async getDashboardStats() {
        return this.superAdminService.getDashboardStats();
    }
    async createOrganization(data) {
        return this.superAdminService.createOrganization(data);
    }
    async getAllOrganizations(accountType, isAuthorized, isActive) {
        const filters = {};
        if (accountType)
            filters.accountType = accountType;
        if (isAuthorized !== undefined)
            filters.isAuthorized = isAuthorized === 'true';
        if (isActive !== undefined)
            filters.isActive = isActive === 'true';
        return this.superAdminService.getAllOrganizations(filters);
    }
    async getMapData(accountType) {
        const filters = {};
        if (accountType)
            filters.accountType = accountType;
        return this.superAdminService.getMapData(filters);
    }
    async getOrganization(id) {
        return this.superAdminService.getOrganizationById(id);
    }
    async updateOrganization(id, data) {
        return this.superAdminService.updateOrganization(id, data);
    }
    async deleteOrganization(id) {
        return this.superAdminService.deleteOrganization(id);
    }
    async getAllCategories() {
        return this.superAdminService.getAllCategories();
    }
    async createCategory(data) {
        return this.superAdminService.createCategory(data);
    }
    async updateCategory(id, data) {
        return this.superAdminService.updateCategory(id, data);
    }
    async deleteCategory(id) {
        return this.superAdminService.deleteCategory(id);
    }
    async getSubCategories(categoryId) {
        return this.superAdminService.getSubCategories(categoryId);
    }
    async createSubCategory(categoryId, data) {
        return this.superAdminService.createSubCategory(categoryId, data);
    }
    async getAuthorizedOrganizations() {
        return this.superAdminService.getAuthorizedOrganizations();
    }
    async getRSAOrganizations() {
        return this.superAdminService.getRSAOrganizations();
    }
    async getOnlineBookings(organizationId, status, startDate, endDate) {
        const filters = {};
        if (organizationId)
            filters.organizationId = organizationId;
        if (status)
            filters.status = status;
        if (startDate)
            filters.startDate = startDate;
        if (endDate)
            filters.endDate = endDate;
        return this.superAdminService.getAllBookings(filters);
    }
};
exports.SuperAdminController = SuperAdminController;
__decorate([
    (0, common_1.Get)('dashboard/stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "getDashboardStats", null);
__decorate([
    (0, common_1.Post)('organizations'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "createOrganization", null);
__decorate([
    (0, common_1.Get)('organizations'),
    __param(0, (0, common_1.Query)('accountType')),
    __param(1, (0, common_1.Query)('isAuthorized')),
    __param(2, (0, common_1.Query)('isActive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "getAllOrganizations", null);
__decorate([
    (0, common_1.Get)('organizations/map'),
    __param(0, (0, common_1.Query)('accountType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "getMapData", null);
__decorate([
    (0, common_1.Get)('organizations/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "getOrganization", null);
__decorate([
    (0, common_1.Put)('organizations/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "updateOrganization", null);
__decorate([
    (0, common_1.Delete)('organizations/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "deleteOrganization", null);
__decorate([
    (0, common_1.Get)('categories'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "getAllCategories", null);
__decorate([
    (0, common_1.Post)('categories'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "createCategory", null);
__decorate([
    (0, common_1.Put)('categories/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "updateCategory", null);
__decorate([
    (0, common_1.Delete)('categories/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "deleteCategory", null);
__decorate([
    (0, common_1.Get)('categories/:id/sub-categories'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "getSubCategories", null);
__decorate([
    (0, common_1.Post)('categories/:id/sub-categories'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "createSubCategory", null);
__decorate([
    (0, common_1.Get)('authorized-organizations'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "getAuthorizedOrganizations", null);
__decorate([
    (0, common_1.Get)('rsa-organizations'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "getRSAOrganizations", null);
__decorate([
    (0, common_1.Get)('bookings'),
    __param(0, (0, common_1.Query)('organizationId')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('startDate')),
    __param(3, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "getOnlineBookings", null);
exports.SuperAdminController = SuperAdminController = __decorate([
    (0, common_1.Controller)('super-admin'),
    __metadata("design:paramtypes", [super_admin_service_1.SuperAdminService])
], SuperAdminController);
//# sourceMappingURL=super-admin.controller.js.map