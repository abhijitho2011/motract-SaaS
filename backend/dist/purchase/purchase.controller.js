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
exports.PurchaseController = void 0;
const common_1 = require("@nestjs/common");
const purchase_service_1 = require("./purchase.service");
let PurchaseController = class PurchaseController {
    purchaseService;
    constructor(purchaseService) {
        this.purchaseService = purchaseService;
    }
    async createSupplier(data) {
        return this.purchaseService.createSupplier(data);
    }
    async getSuppliers(workshopId) {
        return this.purchaseService.getSuppliers(workshopId);
    }
    async getSupplier(id) {
        return this.purchaseService.getSupplier(id);
    }
    async getSupplierLedger(id) {
        return this.purchaseService.getSupplierLedger(id);
    }
    async createPurchaseOrder(data) {
        return this.purchaseService.createPurchaseOrder(data);
    }
    async getPurchaseOrders(workshopId) {
        return this.purchaseService.getPurchaseOrders(workshopId);
    }
    async getPurchaseOrder(id) {
        return this.purchaseService.getPurchaseOrder(id);
    }
    async updateStatus(id, status) {
        return this.purchaseService.updatePurchaseOrderStatus(id, status);
    }
    async receiveOrder(id) {
        return this.purchaseService.receivePurchaseOrder(id);
    }
};
exports.PurchaseController = PurchaseController;
__decorate([
    (0, common_1.Post)('suppliers'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PurchaseController.prototype, "createSupplier", null);
__decorate([
    (0, common_1.Get)('suppliers'),
    __param(0, (0, common_1.Query)('workshopId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PurchaseController.prototype, "getSuppliers", null);
__decorate([
    (0, common_1.Get)('suppliers/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PurchaseController.prototype, "getSupplier", null);
__decorate([
    (0, common_1.Get)('suppliers/:id/ledger'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PurchaseController.prototype, "getSupplierLedger", null);
__decorate([
    (0, common_1.Post)('orders'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PurchaseController.prototype, "createPurchaseOrder", null);
__decorate([
    (0, common_1.Get)('orders'),
    __param(0, (0, common_1.Query)('workshopId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PurchaseController.prototype, "getPurchaseOrders", null);
__decorate([
    (0, common_1.Get)('orders/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PurchaseController.prototype, "getPurchaseOrder", null);
__decorate([
    (0, common_1.Patch)('orders/:id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PurchaseController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Post)('orders/:id/receive'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PurchaseController.prototype, "receiveOrder", null);
exports.PurchaseController = PurchaseController = __decorate([
    (0, common_1.Controller)('purchase'),
    __metadata("design:paramtypes", [purchase_service_1.PurchaseService])
], PurchaseController);
//# sourceMappingURL=purchase.controller.js.map