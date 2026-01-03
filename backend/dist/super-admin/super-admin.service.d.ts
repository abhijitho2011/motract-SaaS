import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../drizzle/schema';
export declare class SuperAdminService {
    private db;
    constructor(db: NodePgDatabase<typeof schema>);
    createOrganization(data: {
        accountType: 'WORKSHOP' | 'RSA' | 'SUPPLIER' | 'REBUILD_CENTER';
        name: string;
        email: string;
        phone: string;
        address?: string;
        city?: string;
        state?: string;
        pincode?: string;
        gstin?: string;
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
            address: string | null;
            city: string | null;
            state: string | null;
            pincode: string | null;
            gstin: string | null;
            isActive: boolean;
            accountType: "SUPPLIER" | "WORKSHOP" | "RSA" | "REBUILD_CENTER";
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
        address: string | null;
        city: string | null;
        state: string | null;
        pincode: string | null;
        gstin: string | null;
        isActive: boolean;
        accountType: "SUPPLIER" | "WORKSHOP" | "RSA" | "REBUILD_CENTER";
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
        address: string | null;
        city: string | null;
        state: string | null;
        pincode: string | null;
        gstin: string | null;
        isActive: boolean;
        accountType: "SUPPLIER" | "WORKSHOP" | "RSA" | "REBUILD_CENTER";
        phone: string;
        isAuthorized: boolean;
        createdBy: string | null;
    }>;
    updateOrganization(id: string, data: {
        name?: string;
        email?: string;
        phone?: string;
        address?: string;
        city?: string;
        state?: string;
        pincode?: string;
        gstin?: string;
        isAuthorized?: boolean;
        isActive?: boolean;
    }): Promise<{
        id: string;
        accountType: "SUPPLIER" | "WORKSHOP" | "RSA" | "REBUILD_CENTER";
        name: string;
        email: string;
        phone: string;
        address: string | null;
        city: string | null;
        state: string | null;
        pincode: string | null;
        gstin: string | null;
        isAuthorized: boolean;
        isActive: boolean;
        createdBy: string | null;
        createdAt: string;
        updatedAt: string;
    }>;
    deleteOrganization(id: string): Promise<{
        message: string;
    }>;
    getAuthorizedOrganizations(): Promise<{
        id: string;
        name: string;
        createdAt: string;
        updatedAt: string;
        email: string;
        address: string | null;
        city: string | null;
        state: string | null;
        pincode: string | null;
        gstin: string | null;
        isActive: boolean;
        accountType: "SUPPLIER" | "WORKSHOP" | "RSA" | "REBUILD_CENTER";
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
        address: string | null;
        city: string | null;
        state: string | null;
        pincode: string | null;
        gstin: string | null;
        isActive: boolean;
        accountType: "SUPPLIER" | "WORKSHOP" | "RSA" | "REBUILD_CENTER";
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
            rsa: number;
            supplier: number;
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
}
