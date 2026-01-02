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
exports.SlotController = void 0;
const common_1 = require("@nestjs/common");
const slot_service_1 = require("./slot.service");
let SlotController = class SlotController {
    slotService;
    constructor(slotService) {
        this.slotService = slotService;
    }
    async setWorkingHours(body) {
        return this.slotService.setWorkingHours(body.workshopId, body.hours);
    }
    async getWorkingHours(workshopId) {
        return this.slotService.getWorkingHours(workshopId);
    }
    async setBreaks(body) {
        return this.slotService.setBreaks(body.workshopId, body.breaks);
    }
    async createBay(data) {
        return this.slotService.createBay(data);
    }
    async findBays(workshopId) {
        return this.slotService.findBays(workshopId);
    }
    async mapService(bayId, serviceId) {
        return this.slotService.mapServiceToBay(bayId, serviceId);
    }
    async getAvailableSlots(workshopId, date, serviceId) {
        return this.slotService.getAvailableSlots(workshopId, date, serviceId);
    }
    async bookSlot(data) {
        return this.slotService.bookSlot(data);
    }
};
exports.SlotController = SlotController;
__decorate([
    (0, common_1.Post)('config/working-hours'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SlotController.prototype, "setWorkingHours", null);
__decorate([
    (0, common_1.Get)('config/working-hours'),
    __param(0, (0, common_1.Query)('workshopId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SlotController.prototype, "getWorkingHours", null);
__decorate([
    (0, common_1.Post)('config/breaks'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SlotController.prototype, "setBreaks", null);
__decorate([
    (0, common_1.Post)('bays'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SlotController.prototype, "createBay", null);
__decorate([
    (0, common_1.Get)('bays'),
    __param(0, (0, common_1.Query)('workshopId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SlotController.prototype, "findBays", null);
__decorate([
    (0, common_1.Post)('bays/:bayId/assign-service'),
    __param(0, (0, common_1.Param)('bayId')),
    __param(1, (0, common_1.Body)('serviceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SlotController.prototype, "mapService", null);
__decorate([
    (0, common_1.Get)('available'),
    __param(0, (0, common_1.Query)('workshopId')),
    __param(1, (0, common_1.Query)('date')),
    __param(2, (0, common_1.Query)('serviceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], SlotController.prototype, "getAvailableSlots", null);
__decorate([
    (0, common_1.Post)('book'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SlotController.prototype, "bookSlot", null);
exports.SlotController = SlotController = __decorate([
    (0, common_1.Controller)('slots'),
    __metadata("design:paramtypes", [slot_service_1.SlotService])
], SlotController);
//# sourceMappingURL=slot.controller.js.map