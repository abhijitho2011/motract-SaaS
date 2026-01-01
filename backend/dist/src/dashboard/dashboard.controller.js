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
exports.DashboardController = void 0;
const common_1 = require("@nestjs/common");
const dashboard_service_1 = require("./dashboard.service");
let DashboardController = class DashboardController {
    dashboardService;
    constructor(dashboardService) {
        this.dashboardService = dashboardService;
    }
    async getKPIs(workshopId) {
        return this.dashboardService.getKPIs(workshopId);
    }
    async getJobStatusFunnel(workshopId) {
        return this.dashboardService.getJobStatusFunnel(workshopId);
    }
    async getRevenueGraph(workshopId, days) {
        const daysNum = days ? parseInt(days, 10) : 7;
        return this.dashboardService.getRevenueGraph(workshopId, daysNum);
    }
    async getTopServices(workshopId, limit) {
        const limitNum = limit ? parseInt(limit, 10) : 5;
        return this.dashboardService.getTopServices(workshopId, limitNum);
    }
};
exports.DashboardController = DashboardController;
__decorate([
    (0, common_1.Get)('kpis'),
    __param(0, (0, common_1.Query)('workshopId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getKPIs", null);
__decorate([
    (0, common_1.Get)('job-funnel'),
    __param(0, (0, common_1.Query)('workshopId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getJobStatusFunnel", null);
__decorate([
    (0, common_1.Get)('revenue-graph'),
    __param(0, (0, common_1.Query)('workshopId')),
    __param(1, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getRevenueGraph", null);
__decorate([
    (0, common_1.Get)('top-services'),
    __param(0, (0, common_1.Query)('workshopId')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getTopServices", null);
exports.DashboardController = DashboardController = __decorate([
    (0, common_1.Controller)('dashboard'),
    __metadata("design:paramtypes", [dashboard_service_1.DashboardService])
], DashboardController);
//# sourceMappingURL=dashboard.controller.js.map