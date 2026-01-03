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
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let SlotController = class SlotController {
    slotService;
    constructor(slotService) {
        this.slotService = slotService;
    }
    async createBay(req, data) {
        return this.slotService.createBay({
            ...data,
            workshopId: req.user.workshopId,
        });
    }
    async findBays(req) {
        return this.slotService.findBays(req.user.workshopId);
    }
    async bookSlot(data) {
        return this.slotService.bookSlot(data);
    }
    async updateBay(id, data) {
        return this.slotService.updateBay(id, data);
    }
    async deleteBay(id) {
        return this.slotService.deleteBay(id);
    }
};
exports.SlotController = SlotController;
__decorate([
    (0, common_1.Post)('bays'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SlotController.prototype, "createBay", null);
__decorate([
    (0, common_1.Get)('bays'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SlotController.prototype, "findBays", null);
__decorate([
    (0, common_1.Post)('book'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SlotController.prototype, "bookSlot", null);
__decorate([
    (0, common_1.Put)('bays/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SlotController.prototype, "updateBay", null);
__decorate([
    (0, common_1.Delete)('bays/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SlotController.prototype, "deleteBay", null);
exports.SlotController = SlotController = __decorate([
    (0, common_1.Controller)('slots'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [slot_service_1.SlotService])
], SlotController);
//# sourceMappingURL=slot.controller.js.map