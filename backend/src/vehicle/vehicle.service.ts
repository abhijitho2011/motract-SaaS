import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Vehicle } from '@prisma/client';

@Injectable()
export class VehicleService {
    constructor(private prisma: PrismaService) { }

    async lookup(regNumber: string) {
        const vehicle = await this.prisma.vehicle.findUnique({
            where: { regNumber: regNumber },
            include: {
                variant: {
                    include: {
                        model: {
                            include: {
                                make: true,
                            },
                        },
                    },
                },
            },
        });
        return vehicle;
    }

    async register(data: Prisma.VehicleCreateInput) {
        // Basic validation handled by Prisma constraints (unique regNumber)
        return this.prisma.vehicle.create({
            data,
        });
    }

    async findAllModels() {
        return this.prisma.vehicleModel.findMany({
            include: { make: true, variants: true }
        });
    }
}
