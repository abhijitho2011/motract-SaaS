import { VehicleService } from './vehicle.service';
export declare class VehicleController {
    private readonly vehicleService;
    constructor(vehicleService: VehicleService);
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
    getModels(): Promise<{
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
