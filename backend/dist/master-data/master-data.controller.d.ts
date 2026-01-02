import { MasterDataService } from './master-data.service';
import { BrandType } from '../drizzle/types';
export declare class MasterDataController {
    private readonly masterDataService;
    constructor(masterDataService: MasterDataService);
    getBrands(): Promise<{
        id: string;
        name: string;
        type: "OEM" | "AFTERMARKET";
        status: boolean;
    }[]>;
    createBrand(body: {
        id: string;
        name: string;
        type: BrandType;
    }): Promise<{
        id: string;
        name: string;
        type: "OEM" | "AFTERMARKET";
        status: boolean;
    }[]>;
    getCategories(): Promise<{
        id: string;
        name: string;
        subCategories: {
            id: string;
            name: string;
            categoryId: string;
        }[];
    }[]>;
    createCategory(body: {
        id: string;
        name: string;
    }): Promise<{
        id: string;
        name: string;
    }[]>;
    createSubCategory(body: {
        id: string;
        categoryId: string;
        name: string;
    }): Promise<{
        id: string;
        name: string;
        categoryId: string;
    }[]>;
}
