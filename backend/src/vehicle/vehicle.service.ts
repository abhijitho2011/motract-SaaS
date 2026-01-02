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

    async register(data: any) {
        const { regNumber, make, model, variant, engineNumber, chassisNumber, vin, year } = data;

        // 1. Find or Create Make
        const makeRecord = await this.prisma.make.upsert({
            where: { name: make },
            update: {},
            create: { name: make },
        });

        // 2. Find or Create Model
        const modelRecord = await this.prisma.vehicleModel.upsert({
            where: { makeId_name: { makeId: makeRecord.id, name: model } },
            update: {},
            create: { name: model, makeId: makeRecord.id },
        });

        // 3. Find or Create Variant
        // Defaulting fuel type to PETROL for now if not provided
        const variantRecord = await this.prisma.variant.upsert({
            where: {
                modelId_name_fuelType: {
                    modelId: modelRecord.id,
                    name: variant,
                    fuelType: 'PETROL'
                }
            },
            update: {},
            create: {
                name: variant,
                modelId: modelRecord.id,
                fuelType: 'PETROL'
            },
        });

        // 4. Create Vehicle
        return this.prisma.vehicle.create({
            data: {
                regNumber,
                engineNumber,
                chassisNumber,
                vin,
                mfgYear: year,
                variantId: variantRecord.id,
                // Owners not included
            },
        });
    }

    async findAllModels() {
        return this.prisma.vehicleModel.findMany({
            include: { make: true, variants: true }
        });
    }
}
