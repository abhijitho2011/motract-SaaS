import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { DrizzleAsyncProvider } from '../drizzle/drizzle.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../drizzle/schema';
import {
    organizations,
    superAdmins,
    onlineBookings,
    users,
} from '../drizzle/schema';
import { eq, and, desc, asc } from 'drizzle-orm';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SuperAdminService {
    constructor(
        @Inject(DrizzleAsyncProvider)
        private db: NodePgDatabase<typeof schema>,
    ) { }

    // Account Management
    async createOrganization(data: {
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
        createdBy: string; // Super admin ID
        adminUser: {
            name: string;
            email: string;
            password: string;
        };
    }) {
        // RSA is always authorized
        const isAuthorized = data.accountType === 'RSA' ? true : (data.isAuthorized || false);

        // Create organization
        const [organization] = await this.db.insert(organizations).values({
            id: crypto.randomUUID(),
            accountType: data.accountType,
            name: data.name,
            email: data.email,
            phone: data.phone,
            address: data.address,
            city: data.city,
            state: data.state,
            pincode: data.pincode,
            gstin: data.gstin,
            isAuthorized,
            isActive: true,
            createdBy: data.createdBy,
            updatedAt: new Date().toISOString(),
        }).returning();

        // Create admin user for the organization
        const hashedPassword = await bcrypt.hash(data.adminUser.password, 10);
        const [adminUser] = await this.db.insert(users).values({
            id: crypto.randomUUID(),
            email: data.adminUser.email,
            mobile: data.phone, // Use organization phone as user mobile
            password: hashedPassword,
            name: data.adminUser.name,
            role: data.accountType === 'WORKSHOP' ? 'WORKSHOP_ADMIN' :
                data.accountType === 'RSA' ? 'RSA_PROVIDER' : 'SUPPLIER',
            workshopId: organization.id, // Link to organization
            updatedAt: new Date().toISOString(),
        }).returning();

        return { organization, adminUser: { ...adminUser, password: undefined } };
    }

    async getAllOrganizations(filters?: {
        accountType?: string;
        isAuthorized?: boolean;
        isActive?: boolean;
    }) {
        let query = this.db.query.organizations.findMany({
            orderBy: [desc(organizations.createdAt)],
        });

        // Apply filters if provided
        // Note: Drizzle query builder doesn't support dynamic where easily,
        // so we'll fetch all and filter in memory for now
        // In production, use proper query building
        const allOrgs = await query;

        let filtered = allOrgs;
        if (filters?.accountType) {
            filtered = filtered.filter(o => o.accountType === filters.accountType);
        }
        if (filters?.isAuthorized !== undefined) {
            filtered = filtered.filter(o => o.isAuthorized === filters.isAuthorized);
        }
        if (filters?.isActive !== undefined) {
            filtered = filtered.filter(o => o.isActive === filters.isActive);
        }

        return filtered;
    }

    async getOrganizationById(id: string) {
        const org = await this.db.query.organizations.findFirst({
            where: eq(organizations.id, id),
        });

        if (!org) {
            throw new NotFoundException('Organization not found');
        }

        return org;
    }

    async updateOrganization(id: string, data: {
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
    }) {
        const [updated] = await this.db.update(organizations)
            .set({
                ...data,
                updatedAt: new Date().toISOString(),
            })
            .where(eq(organizations.id, id))
            .returning();

        if (!updated) {
            throw new NotFoundException('Organization not found');
        }

        return updated;
    }

    async deleteOrganization(id: string) {
        const [deleted] = await this.db.delete(organizations)
            .where(eq(organizations.id, id))
            .returning();

        if (!deleted) {
            throw new NotFoundException('Organization not found');
        }

        return { message: 'Organization deleted successfully' };
    }

    // Monitoring
    async getAuthorizedOrganizations() {
        return this.db.query.organizations.findMany({
            where: and(
                eq(organizations.isAuthorized, true),
                eq(organizations.isActive, true),
            ),
            orderBy: [asc(organizations.name)],
        });
    }

    async getRSAOrganizations() {
        return this.db.query.organizations.findMany({
            where: eq(organizations.accountType, 'RSA'),
            orderBy: [asc(organizations.name)],
        });
    }

    // Online Bookings
    async getAllBookings(filters?: {
        organizationId?: string;
        status?: string;
        startDate?: string;
        endDate?: string;
    }) {
        const allBookings = await this.db.query.onlineBookings.findMany({
            orderBy: [desc(onlineBookings.createdAt)],
        });

        let filtered = allBookings;
        if (filters?.organizationId) {
            filtered = filtered.filter(b => b.organizationId === filters.organizationId);
        }
        if (filters?.status) {
            filtered = filtered.filter(b => b.status === filters.status);
        }
        // Add date filtering if needed

        return filtered;
    }

    // Dashboard Stats
    async getDashboardStats() {
        const allOrgs = await this.db.query.organizations.findMany();
        const allBookings = await this.db.query.onlineBookings.findMany();

        const stats = {
            totalOrganizations: allOrgs.length,
            byType: {
                workshop: allOrgs.filter(o => o.accountType === 'WORKSHOP').length,
                rsa: allOrgs.filter(o => o.accountType === 'RSA').length,
                supplier: allOrgs.filter(o => o.accountType === 'SUPPLIER').length,
                rebuildCenter: allOrgs.filter(o => o.accountType === 'REBUILD_CENTER').length,
            },
            authorized: allOrgs.filter(o => o.isAuthorized).length,
            active: allOrgs.filter(o => o.isActive).length,
            bookings: {
                total: allBookings.length,
                pending: allBookings.filter(b => b.status === 'PENDING').length,
                confirmed: allBookings.filter(b => b.status === 'CONFIRMED').length,
                completed: allBookings.filter(b => b.status === 'COMPLETED').length,
            },
        };

        return stats;
    }
}
