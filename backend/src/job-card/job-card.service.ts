import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, JobStage, JobPriority } from '@prisma/client';

@Injectable()
export class JobCardService {
    constructor(private prisma: PrismaService) { }

    async create(data: {
        workshopId: string;
        vehicleRegNumber: string;
        customerId: string;
        advisorId?: string;
        odometer?: number;
        fuelLevel?: number;
        complaints?: string[];
        priority?: JobPriority;
    }) {
        // 1. Find Vehicle
        const vehicle = await this.prisma.vehicle.findUnique({
            where: { regNumber: data.vehicleRegNumber },
        });

        if (!vehicle) {
            throw new NotFoundException('Vehicle not found. Please register vehicle first.');
        }

        // 2. Create Job Card
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
                stage: JobStage.CREATED,
            },
            include: {
                vehicle: true,
                customer: true,
                complaints: true,
            },
        });
    }

    async findAll(workshopId: string) {
        return this.prisma.jobCard.findMany({
            where: { workshopId },
            include: {
                vehicle: { include: { variant: { include: { model: { include: { make: true } } } } } },
                customer: true,
            },
            orderBy: { updatedAt: 'desc' },
        });
    }

    async findOne(id: string) {
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
        if (!jobCard) throw new NotFoundException('Job Card not found');
        return jobCard;
    }

    async updateStage(id: string, stage: JobStage) {
        return this.prisma.jobCard.update({
            where: { id },
            data: { stage },
        });
    }
}
