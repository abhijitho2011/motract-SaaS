import { VehicleService } from './vehicle.service';
import { Prisma } from '@prisma/client';
export declare class VehicleController {
    private readonly vehicleService;
    constructor(vehicleService: VehicleService);
    lookup(regNumber: string): Promise<({
        variant: {
            model: {
                make: {
                    id: string;
                    name: string;
                };
            } & {
                id: string;
                name: string;
                makeId: string;
            };
        } & {
            id: string;
            name: string;
            fuelType: import(".prisma/client").$Enums.FuelType;
            modelId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        regNumber: string;
        chassisNumber: string | null;
        engineNumber: string | null;
        vin: string | null;
        mfgYear: number | null;
        variantId: string;
    }) | null>;
    register(data: Prisma.VehicleCreateInput): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        regNumber: string;
        chassisNumber: string | null;
        engineNumber: string | null;
        vin: string | null;
        mfgYear: number | null;
        variantId: string;
    }>;
    getModels(): Promise<({
        make: {
            id: string;
            name: string;
        };
        variants: {
            id: string;
            name: string;
            fuelType: import(".prisma/client").$Enums.FuelType;
            modelId: string;
        }[];
    } & {
        id: string;
        name: string;
        makeId: string;
    })[]>;
}
