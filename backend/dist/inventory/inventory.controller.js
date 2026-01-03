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
exports.InventoryController = void 0;
const common_1 = require("@nestjs/common");
const inventory_service_1 = require("./inventory.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let InventoryController = class InventoryController {
    inventoryService;
    constructor(inventoryService) {
        this.inventoryService = inventoryService;
    }
    async getBrands() {
        return this.inventoryService.getBrands();
    }
    async createBrand(body) {
        return this.inventoryService.createBrand(body.name);
    }
    async getCategories() {
        return this.inventoryService.getCategories();
    }
    async createCategory(body) {
        return this.inventoryService.createCategory(body.name);
    }
    async getSubCategories(categoryId) {
        return this.inventoryService.getSubCategories(categoryId);
    }
    async createSubCategory(body) {
        return this.inventoryService.createSubCategory(body.categoryId, body.name);
    }
    async createItem(req, data) {
        return this.inventoryService.createItem({ ...data, workshopId: req.user.workshopId });
    }
    async addSku(id, skuCode) {
        return this.inventoryService.addSku(id, skuCode);
    }
    async addBatch(id, body) {
        return this.inventoryService.addBatch(id, body);
    }
    async findAll(req, queryWorkshopId) {
        if (req.user.role === 'SUPER_ADMIN' && queryWorkshopId) {
            return this.inventoryService.findAll(queryWorkshopId);
        }
        return this.inventoryService.findAll(req.user.workshopId);
    }
    async findOne(id) {
        return this.inventoryService.findOne(id);
    }
    async addCompatibility(id, modelId, variantId) {
        return this.inventoryService.addCompatibility(id, modelId, variantId);
    }
    async getCompatibility(id) {
        return this.inventoryService.getCompatibility(id);
    }
    async adjustStock(id, quantity, reason) {
        return this.inventoryService.adjustStock(id, quantity, reason);
    }
};
exports.InventoryController = InventoryController;
__decorate([
    (0, common_1.Get)('masters/brands'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "getBrands", null);
__decorate([
    (0, common_1.Post)('masters/brands'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "createBrand", null);
__decorate([
    (0, common_1.Get)('masters/categories'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "getCategories", null);
__decorate([
    (0, common_1.Post)('masters/categories'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "createCategory", null);
__decorate([
    (0, common_1.Get)('masters/sub-categories'),
    __param(0, (0, common_1.Query)('categoryId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "getSubCategories", null);
__decorate([
    (0, common_1.Post)('masters/sub-categories'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "createSubCategory", null);
__decorate([
    (0, common_1.Post)('items'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "createItem", null);
__decorate([
    (0, common_1.Post)('items/:id/skus'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('skuCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "addSku", null);
__decorate([
    (0, common_1.Post)('items/:id/batches'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "addBatch", null);
__decorate([
    (0, common_1.Get)('items'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('workshopId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('items/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)('items/:id/compatibility'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('modelId')),
    __param(2, (0, common_1.Body)('variantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "addCompatibility", null);
__decorate([
    (0, common_1.Get)('items/:id/compatibility'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "getCompatibility", null);
__decorate([
    (0, common_1.Post)('items/:id/adjust'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('quantity')),
    __param(2, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "adjustStock", null);
exports.InventoryController = InventoryController = __decorate([
    (0, common_1.Controller)('inventory'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [inventory_service_1.InventoryService])
], InventoryController);
//# sourceMappingURL=inventory.controller.js.map