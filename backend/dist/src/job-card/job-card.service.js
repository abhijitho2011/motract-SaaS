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
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobCardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let JobCardService = class JobCardService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const vehicle = await this.prisma.vehicle.findUnique({
            where: { regNumber: data.vehicleRegNumber },
        });
        if (!vehicle) {
            throw new common_1.NotFoundException('Vehicle not found. Please register vehicle first.');
        }
        return this.prisma.jobCard.create({
            data: {
                workshopId: data.workshopId,
                vehicleId: vehicle.id,
                customerId: data.customerId,
                advisorId: data.advisorId,
                odometer: data.odometer,
                fuelLevel: data.fuelLevel,
                priority: data.priority,
                complaints: {
                    create: data.complaints?.map((c) => ({ complaint: c })),
                },
                stage: client_1.JobStage.CREATED,
            },
            include: {
                vehicle: true,
                customer: true,
                complaints: true,
            },
        });
    }
    async findAll(workshopId) {
        return this.prisma.jobCard.findMany({
            where: { workshopId },
            include: {
                vehicle: { include: { variant: { include: { model: { include: { make: true } } } } } },
                customer: true,
            },
            orderBy: { updatedAt: 'desc' },
        });
    }
    async findOne(id) {
        const jobCard = await this.prisma.jobCard.findUnique({
            where: { id },
            include: {
                vehicle: { include: { variant: { include: { model: { include: { make: true } } } } } },
                customer: true,
                complaints: true,
                inspection: true,
                tasks: true,
                parts: { include: { item: true } },
            },
        });
        if (!jobCard)
            throw new common_1.NotFoundException('Job Card not found');
        return jobCard;
    }
    async updateStage(id, stage) {
        return this.prisma.jobCard.update({
            where: { id },
            data: { stage },
        });
    }
};
exports.JobCardService = JobCardService;
exports.JobCardService = JobCardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], JobCardService);
//# sourceMappingURL=job-card.service.js.map