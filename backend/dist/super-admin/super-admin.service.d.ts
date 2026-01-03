import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../drizzle/schema';
export declare class SuperAdminService {
    private db;
    constructor(db: NodePgDatabase<typeof schema>);
    createOrganization(data: {
        accountType: 'WORKSHOP' | 'SUPPLIER' | 'RSA' | 'REBUILD_CENTER';
        subCategory?: string;
        businessName: string;
        email: string;
        phone: string;
        address: string;
        city?: string;
        state?: string;
        pincode?: string;
        gstin?: string;
        latitude?: number;
        longitude?: number;
        isAuthorized?: boolean;
        createdBy: string;
        adminUser: {
            name: string;
            email: string;
            password: string;
        };
    }): Promise<{
        organization: {
            id: string;
            name: string;
            createdAt: string;
            updatedAt: string;
            email: string;
            address: string;
            city: string | null;
            state: string | null;
            pincode: string | null;
            gstin: string | null;
            isActive: boolean;
            latitude: number | null;
            longitude: number | null;
            accountType: "SUPPLIER" | "WORKSHOP" | "RSA" | "REBUILD_CENTER";
            subCategory: string | null;
            businessName: string;
            phone: string;
            isAuthorized: boolean;
            createdBy: string | null;
        };
        adminUser: {
            password: undefined;
            id: string;
            name: string | null;
            createdAt: string;
            updatedAt: string;
            email: string | null;
            mobile: string;
            role: "SUPER_ADMIN" | "WORKSHOP_ADMIN" | "WORKSHOP_MANAGER" | "TECHNICIAN" | "CLIENT" | "RSA_PROVIDER" | "SUPPLIER";
            workshopId: string | null;
        };
    }>;
    getAllOrganizations(filters?: {
        accountType?: string;
        isAuthorized?: boolean;
        isActive?: boolean;
    }): Promise<{
        id: string;
        name: string;
        createdAt: string;
        updatedAt: string;
        email: string;
        address: string;
        city: string | null;
        state: string | null;
        pincode: string | null;
        gstin: string | null;
        isActive: boolean;
        latitude: number | null;
        longitude: number | null;
        accountType: "SUPPLIER" | "WORKSHOP" | "RSA" | "REBUILD_CENTER";
        subCategory: string | null;
        businessName: string;
        phone: string;
        isAuthorized: boolean;
        createdBy: string | null;
    }[]>;
    getOrganizationById(id: string): Promise<{
        id: string;
        name: string;
        createdAt: string;
        updatedAt: string;
        email: string;
        address: string;
        city: string | null;
        state: string | null;
        pincode: string | null;
        gstin: string | null;
        isActive: boolean;
        latitude: number | null;
        longitude: number | null;
        accountType: "SUPPLIER" | "WORKSHOP" | "RSA" | "REBUILD_CENTER";
        subCategory: string | null;
        businessName: string;
        phone: string;
        isAuthorized: boolean;
        createdBy: string | null;
    }>;
    updateOrganization(id: string, data: {
        businessName?: string;
        email?: string;
        phone?: string;
        address?: string;
        city?: string;
        state?: string;
        pincode?: string;
        gstin?: string;
        latitude?: number;
        longitude?: number;
        subCategory?: string;
        isAuthorized?: boolean;
        isActive?: boolean;
    }): Promise<{
        id: string;
        accountType: "SUPPLIER" | "WORKSHOP" | "RSA" | "REBUILD_CENTER";
        subCategory: string | null;
        businessName: string;
        name: string;
        email: string;
        phone: string;
        address: string;
        city: string | null;
        state: string | null;
        pincode: string | null;
        gstin: string | null;
        latitude: number | null;
        longitude: number | null;
        isAuthorized: boolean;
        isActive: boolean;
        createdBy: string | null;
        createdAt: string;
        updatedAt: string;
    }>;
    deleteOrganization(id: string): Promise<{
        message: string;
    }>;
    getMapData(filters?: {
        accountType?: string;
    }): Promise<{
        id: string;
        name: string;
        createdAt: string;
        updatedAt: string;
        email: string;
        address: string;
        city: string | null;
        state: string | null;
        pincode: string | null;
        gstin: string | null;
        isActive: boolean;
        latitude: number | null;
        longitude: number | null;
        accountType: "SUPPLIER" | "WORKSHOP" | "RSA" | "REBUILD_CENTER";
        subCategory: string | null;
        businessName: string;
        phone: string;
        isAuthorized: boolean;
        createdBy: string | null;
    }[]>;
    getAllCategories(): Promise<{
        id: string;
        name: string;
        createdAt: string;
        description: string | null;
        canHaveSubCategories: boolean;
    }[]>;
    createCategory(data: {
        name: string;
        description?: string;
        canHaveSubCategories?: boolean;
    }): Promise<{
        id: string;
        name: string;
        createdAt: string;
        description: string | null;
        canHaveSubCategories: boolean;
    }>;
    updateCategory(id: string, data: {
        name?: string;
        description?: string;
        canHaveSubCategories?: boolean;
    }): Promise<{
        id: string;
        name: string;
        description: string | null;
        canHaveSubCategories: boolean;
        createdAt: string;
    }>;
    deleteCategory(id: string): Promise<{
        message: string;
    }>;
    getSubCategories(categoryId: string): Promise<{
        id: string;
        name: string;
        createdAt: string;
        description: string | null;
        categoryId: string;
    }[]>;
    createSubCategory(categoryId: string, data: {
        name: string;
        description?: string;
    }): Promise<{
        id: string;
        name: string;
        createdAt: string;
        description: string | null;
        categoryId: string;
    }>;
    getAuthorizedOrganizations(): Promise<{
        id: string;
        name: string;
        createdAt: string;
        updatedAt: string;
        email: string;
        address: string;
        city: string | null;
        state: string | null;
        pincode: string | null;
        gstin: string | null;
        isActive: boolean;
        latitude: number | null;
        longitude: number | null;
        accountType: "SUPPLIER" | "WORKSHOP" | "RSA" | "REBUILD_CENTER";
        subCategory: string | null;
        businessName: string;
        phone: string;
        isAuthorized: boolean;
        createdBy: string | null;
    }[]>;
    getRSAOrganizations(): Promise<{
        id: string;
        name: string;
        createdAt: string;
        updatedAt: string;
        email: string;
        address: string;
        city: string | null;
        state: string | null;
        pincode: string | null;
        gstin: string | null;
        isActive: boolean;
        latitude: number | null;
        longitude: number | null;
        accountType: "SUPPLIER" | "WORKSHOP" | "RSA" | "REBUILD_CENTER";
        subCategory: string | null;
        businessName: string;
        phone: string;
        isAuthorized: boolean;
        createdBy: string | null;
    }[]>;
    getAllBookings(filters?: {
        organizationId?: string;
        status?: string;
        startDate?: string;
        endDate?: string;
    }): Promise<{
        id: string;
        createdAt: string;
        updatedAt: string;
        organizationId: string;
        customerName: string;
        customerMobile: string;
        customerEmail: string | null;
        vehicleRegNumber: string | null;
        serviceType: string | null;
        scheduledDate: string | null;
        status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
        notes: string | null;
    }[]>;
    getDashboardStats(): Promise<{
        totalOrganizations: number;
        byType: {
            workshop: number;
            supplier: number;
            rsa: number;
            rebuildCenter: number;
        };
        authorized: number;
        active: number;
        bookings: {
            total: number;
            pending: number;
            confirmed: number;
            completed: number;
        };
    }>;
    resetDatabase(): Promise<{
        message: string;
    }>;
}
