import { SuperAdminService } from './super-admin.service';
export declare class SuperAdminController {
    private readonly superAdminService;
    constructor(superAdminService: SuperAdminService);
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
    createOrganization(data: any): Promise<{
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
    getAllOrganizations(accountType?: string, isAuthorized?: string, isActive?: string): Promise<{
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
    getOrganization(id: string): Promise<{
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
    updateOrganization(id: string, data: any): Promise<{
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
    getAuthorizedAccounts(): Promise<{
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
    getRSAActivity(): Promise<{
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
    getOnlineBookings(organizationId?: string, status?: string, startDate?: string, endDate?: string): Promise<{
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
}
