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
exports.VehicleController = void 0;
const common_1 = require("@nestjs/common");
const vehicle_service_1 = require("./vehicle.service");
let VehicleController = class VehicleController {
    vehicleService;
    constructor(vehicleService) {
        this.vehicleService = vehicleService;
    }
    async lookup(regNumber) {
        return this.vehicleService.lookup(regNumber);
    }
    async getMakes() {
        return this.vehicleService.getMakes();
    }
    async createMake(body) {
        return this.vehicleService.createMake(body.name);
    }
    async getModels(makeId) {
        return this.vehicleService.getModels(makeId);
    }
    async createModel(body) {
        return this.vehicleService.createModel(body.makeId, body.name);
    }
    async getVariants(modelId) {
        return this.vehicleService.getVariants(modelId);
    }
    async createVariant(body) {
        return this.vehicleService.createVariant(body.modelId, body.name, body.fuelType);
    }
    async register(data) {
        return this.vehicleService.register(data);
    }
};
exports.VehicleController = VehicleController;
__decorate([
    (0, common_1.Get)('lookup/:regNumber'),
    __param(0, (0, common_1.Param)('regNumber')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VehicleController.prototype, "lookup", null);
__decorate([
    (0, common_1.Get)('masters/makes'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], VehicleController.prototype, "getMakes", null);
__decorate([
    (0, common_1.Post)('masters/makes'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], VehicleController.prototype, "createMake", null);
__decorate([
    (0, common_1.Get)('masters/models'),
    __param(0, (0, common_1.Query)('makeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VehicleController.prototype, "getModels", null);
__decorate([
    (0, common_1.Post)('masters/models'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], VehicleController.prototype, "createModel", null);
__decorate([
    (0, common_1.Get)('masters/variants'),
    __param(0, (0, common_1.Query)('modelId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VehicleController.prototype, "getVariants", null);
__decorate([
    (0, common_1.Post)('masters/variants'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], VehicleController.prototype, "createVariant", null);
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], VehicleController.prototype, "register", null);
exports.VehicleController = VehicleController = __decorate([
    (0, common_1.Controller)('vehicle'),
    __metadata("design:paramtypes", [vehicle_service_1.VehicleService])
], VehicleController);
//# sourceMappingURL=vehicle.controller.js.map