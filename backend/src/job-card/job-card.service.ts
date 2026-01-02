import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, JobStage, JobPriority } from '@prisma/client';

@Injectable()
export class JobCardService {
    constructor(private prisma: PrismaService) { }

    async create(data: {
        workshopId: string;
        vehicleId: string;
        customerName: string;
        customerMobile: string;
        advisorId?: string;
        odometer?: number;
        fuelLevel?: number;
        complaints?: string[];
        priority?: JobPriority;
    }) {
        // 1. Find Vehicle
        const vehicle = await this.prisma.vehicle.findUnique({
            where: { id: data.vehicleId },
        });

        if (!vehicle) {
            throw new NotFoundException('Vehicle not found.');
        }

        // 2. Find or Create Customer
        // Note: Using workshopId + mobile as unique constraint based on schema
        const customer = await this.prisma.customer.upsert({
            where: {
                workshopId_mobile: {
                    workshopId: data.workshopId,
                    mobile: data.customerMobile
                }
            },
            update: {
                name: data.customerName, // Update name if exists
            },
            create: {
                workshopId: data.workshopId,
                name: data.customerName,
                mobile: data.customerMobile,
            }
        });

        // 3. Create Job Card
        return this.prisma.jobCard.create({
            data: {
                workshopId: data.workshopId,
                vehicleId: vehicle.id,
                customerId: customer.id,
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

    async saveInspection(jobCardId: string, data: {
        exterior: any;
        interior: any;
        tyres: any;
        battery?: string;
        documents?: any;
        photos: string[];
        fuelLevel?: number;
        odometer?: number;
    }) {
        // 1. Upsert Inspection
        const inspection = await this.prisma.jobInspection.upsert({
            where: { jobCardId },
            create: {
                jobCardId,
                exterior: data.exterior,
                interior: data.interior,
                tyres: data.tyres,
                battery: data.battery,
                documents: data.documents,
                photos: data.photos,
            },
            update: {
                exterior: data.exterior,
                interior: data.interior,
                tyres: data.tyres,
                battery: data.battery,
                documents: data.documents,
                photos: data.photos,
            },
        });

        // 2. Update Job Card Core Fields (Fuel, Odo) & Stage
        await this.prisma.jobCard.update({
            where: { id: jobCardId },
            data: {
                fuelLevel: data.fuelLevel,
                odometer: data.odometer,
                stage: JobStage.INSPECTION_COMPLETED,
            },
        });

        return inspection;
    }
}
