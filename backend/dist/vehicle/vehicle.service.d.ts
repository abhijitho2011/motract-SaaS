import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../drizzle/schema';
export declare class VehicleService {
    private db;
    constructor(db: NodePgDatabase<typeof schema>);
    lookup(regNumber: string): Promise<{
        id: string;
        regNumber: string;
        chassisNumber: string | null;
        engineNumber: string | null;
        vin: string | null;
        mfgYear: number | null;
        variantId: string;
        createdAt: string;
        updatedAt: string;
        variant: {
            id: string;
            name: string;
            fuelType: "PETROL" | "DIESEL" | "CNG" | "ELECTRIC" | "HYBRID";
            modelId: string;
            model: {
                id: string;
                name: string;
                makeId: string;
                make: {
                    id: string;
                    name: string;
                };
            };
        };
    } | null>;
    register(data: any): Promise<{
        id: string;
        regNumber: string;
        chassisNumber: string | null;
        engineNumber: string | null;
        vin: string | null;
        mfgYear: number | null;
        variantId: string;
        createdAt: string;
        updatedAt: string;
    }>;
    createMake(name: string): Promise<{
        id: string;
        name: string;
    }>;
    createModel(makeId: string, name: string): Promise<{
        id: string;
        name: string;
        makeId: string;
    }>;
    createVariant(modelId: string, name: string, fuelType: 'PETROL' | 'DIESEL' | 'CNG' | 'ELECTRIC' | 'HYBRID'): Promise<{
        id: string;
        name: string;
        fuelType: "PETROL" | "DIESEL" | "CNG" | "ELECTRIC" | "HYBRID";
        modelId: string;
    }>;
    findAllModels(): Promise<{
        id: string;
        name: string;
        makeId: string;
        variants: {
            id: string;
            name: string;
            fuelType: "PETROL" | "DIESEL" | "CNG" | "ELECTRIC" | "HYBRID";
            modelId: string;
        }[];
        make: {
            id: string;
            name: string;
        };
    }[]>;
}
