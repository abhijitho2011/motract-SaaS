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
exports.JobCardController = void 0;
const common_1 = require("@nestjs/common");
const job_card_service_1 = require("./job-card.service");
const client_1 = require("@prisma/client");
let JobCardController = class JobCardController {
    jobCardService;
    constructor(jobCardService) {
        this.jobCardService = jobCardService;
    }
    async create(body) {
        return this.jobCardService.create(body);
    }
    async findAll(workshopId) {
        return this.jobCardService.findAll(workshopId);
    }
    async findOne(id) {
        return this.jobCardService.findOne(id);
    }
    async updateStage(id, stage) {
        return this.jobCardService.updateStage(id, stage);
    }
    async saveInspection(id, body) {
        return this.jobCardService.saveInspection(id, body);
    }
    async addTask(id, body) {
        return this.jobCardService.addTask(id, body);
    }
    async addPart(id, body) {
        return this.jobCardService.addPart(id, body);
    }
    async assignTechnician(id, body) {
        return this.jobCardService.assignTechnician(id, body.technicianId);
    }
    async updateTaskStatus(id, taskId, body) {
        return this.jobCardService.updateTaskStatus(id, taskId, body.status);
    }
};
exports.JobCardController = JobCardController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], JobCardController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('workshopId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], JobCardController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], JobCardController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id/stage'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('stage')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], JobCardController.prototype, "updateStage", null);
__decorate([
    (0, common_1.Put)(':id/inspection'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], JobCardController.prototype, "saveInspection", null);
__decorate([
    (0, common_1.Post)(':id/tasks'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], JobCardController.prototype, "addTask", null);
__decorate([
    (0, common_1.Post)(':id/parts'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], JobCardController.prototype, "addPart", null);
__decorate([
    (0, common_1.Patch)(':id/technician'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], JobCardController.prototype, "assignTechnician", null);
__decorate([
    (0, common_1.Patch)(':id/tasks/:taskId/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('taskId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], JobCardController.prototype, "updateTaskStatus", null);
exports.JobCardController = JobCardController = __decorate([
    (0, common_1.Controller)('job-cards'),
    __metadata("design:paramtypes", [job_card_service_1.JobCardService])
], JobCardController);
//# sourceMappingURL=job-card.controller.js.map