import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../drizzle/schema';
import { BrandType } from '../drizzle/types';
export declare class MasterDataService {
    private db;
    constructor(db: NodePgDatabase<typeof schema>);
    getBrands(): Promise<{
        id: string;
        name: string;
        type: "OEM" | "AFTERMARKET";
        status: boolean;
    }[]>;
    createBrand(data: {
        id: string;
        name: string;
        type: BrandType;
    }): Promise<{
        id: string;
        name: string;
        type: "OEM" | "AFTERMARKET";
        status: boolean;
    }[]>;
    updateBrand(id: string, data: Partial<{
        name: string;
        type: BrandType;
        status: boolean;
    }>): Promise<{
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
    createCategory(data: {
        id: string;
        name: string;
    }): Promise<{
        id: string;
        name: string;
    }[]>;
    createSubCategory(data: {
        id: string;
        categoryId: string;
        name: string;
    }): Promise<{
        id: string;
        name: string;
        categoryId: string;
    }[]>;
}
