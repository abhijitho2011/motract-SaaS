import { PrismaService } from '../prisma/prisma.service';
export declare class VehicleService {
    private prisma;
    constructor(prisma: PrismaService);
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
    register(data: any): Promise<{
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
    findAllModels(): Promise<({
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
