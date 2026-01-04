import { Injectable, Inject, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { eq, and, desc, sql, or, inArray } from 'drizzle-orm';
import * as schema from '../drizzle/schema';
import { v4 as uuid } from 'uuid';
import { DrizzleAsyncProvider } from '../drizzle/drizzle.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

const { rsaProfiles, rsaJobs, vehicleServiceHistory, users, vehicles, workshops, organizations } = schema;

@Injectable()
export class RsaService {
    constructor(
        @Inject(DrizzleAsyncProvider)
        private db: NodePgDatabase<typeof schema>,
    ) { }

    // =============================================
    // RSA Profile Management (Admin only)
    // =============================================

    async createProfile(data: {
        userId: string;
        name: string;
        phone: string;
        vehicleType: string;
        services: string[];
    }) {
        const id = uuid();
        const [profile] = await this.db.insert(rsaProfiles).values({
            id,
            userId: data.userId,
            name: data.name,
            phone: data.phone,
            vehicleType: data.vehicleType as any,
            services: data.services,
            isActive: true,
            isOnline: false,
            updatedAt: new Date().toISOString(),
        }).returning();
        return profile;
    }

    async getProfileById(id: string) {
        const profile = await this.db.query.rsaProfiles.findFirst({
            where: eq(rsaProfiles.id, id),
            with: { user: true },
        });
        if (!profile) throw new NotFoundException('RSA profile not found');
        return profile;
    }

    async getProfileByUserId(userId: string) {
        const profile = await this.db.query.rsaProfiles.findFirst({
            where: eq(rsaProfiles.userId, userId),
        });
        return profile;
    }

    // Get or create RSA profile from organization data
    async getOrCreateProfileByUserId(userId: string, organizationId?: string) {
        // First try to find existing profile
        let profile = await this.getProfileByUserId(userId);
        if (profile) {
            return profile;
        }

        // If no profile, try to create from organization
        if (!organizationId) {
            // Try to get organizationId from user's workshopId
            const user = await this.db.query.users.findFirst({
                where: eq(users.id, userId),
            });
            organizationId = user?.workshopId || undefined;
        }

        if (!organizationId) {
            return null;
        }

        // Get organization data
        const org = await this.db.query.organizations.findFirst({
            where: eq(organizations.id, organizationId),
        });

        if (!org || org.accountType !== 'RSA') {
            return null;
        }

        // Auto-create RSA profile from organization
        const id = uuid();
        const [newProfile] = await this.db.insert(rsaProfiles).values({
            id,
            userId,
            name: org.businessName,
            phone: org.phone,
            vehicleType: 'TOW_TRUCK' as any, // Default based on subCategory
            services: ['TOWING', 'RECOVERY'] as any, // Default services
            isActive: true,
            isOnline: false,
            updatedAt: new Date().toISOString(),
        }).returning();

        return newProfile;
    }

    async getAllProfiles(filters?: { isActive?: boolean; isOnline?: boolean }) {
        const conditions = [];
        if (filters?.isActive !== undefined) {
            conditions.push(eq(rsaProfiles.isActive, filters.isActive));
        }
        if (filters?.isOnline !== undefined) {
            conditions.push(eq(rsaProfiles.isOnline, filters.isOnline));
        }

        return await this.db.query.rsaProfiles.findMany({
            where: conditions.length > 0 ? and(...conditions) : undefined,
            with: { user: true },
            orderBy: [desc(rsaProfiles.createdAt)],
        });
    }

    async updateProfile(id: string, data: Partial<{
        name: string;
        phone: string;
        vehicleType: string;
        services: string[];
        isActive: boolean;
    }>) {
        const updateData: any = { ...data, updatedAt: new Date().toISOString() };
        const [updated] = await this.db.update(rsaProfiles)
            .set(updateData)
            .where(eq(rsaProfiles.id, id))
            .returning();
        return updated;
    }

    async suspendProfile(id: string) {
        return this.updateProfile(id, { isActive: false });
    }

    // =============================================
    // RSA Online/Offline & Location
    // =============================================

    async goOnline(rsaId: string, lat: number, lng: number) {
        const [updated] = await this.db.update(rsaProfiles)
            .set({
                isOnline: true,
                currentLat: lat,
                currentLng: lng,
                updatedAt: new Date().toISOString(),
            })
            .where(eq(rsaProfiles.id, rsaId))
            .returning();
        return updated;
    }

    async goOffline(rsaId: string) {
        const [updated] = await this.db.update(rsaProfiles)
            .set({
                isOnline: false,
                currentLat: null,
                currentLng: null,
                updatedAt: new Date().toISOString(),
            })
            .where(eq(rsaProfiles.id, rsaId))
            .returning();
        return updated;
    }

    async updateLocation(rsaId: string, lat: number, lng: number) {
        const [updated] = await this.db.update(rsaProfiles)
            .set({
                currentLat: lat,
                currentLng: lng,
                updatedAt: new Date().toISOString(),
            })
            .where(eq(rsaProfiles.id, rsaId))
            .returning();
        return updated;
    }

    // =============================================
    // RSA Matching Algorithm
    // =============================================

    async findNearestRSA(
        serviceType: string,
        pickupLat: number,
        pickupLng: number,
        radiusKm: number = 15,
        limit: number = 5
    ) {
        // Haversine formula for distance calculation
        const earthRadiusKm = 6371;

        // Find all online RSA with matching service type
        const onlineRSAs = await this.db.query.rsaProfiles.findMany({
            where: and(
                eq(rsaProfiles.isOnline, true),
                eq(rsaProfiles.isActive, true),
            ),
        });

        // Filter by service type and calculate distance
        const matchingRSAs = onlineRSAs
            .filter((rsa: any) => rsa.services.includes(serviceType))
            .filter((rsa: any) => rsa.currentLat && rsa.currentLng)
            .map((rsa: any) => {
                const dLat = this.toRad(rsa.currentLat - pickupLat);
                const dLng = this.toRad(rsa.currentLng - pickupLng);
                const a =
                    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(this.toRad(pickupLat)) * Math.cos(this.toRad(rsa.currentLat)) *
                    Math.sin(dLng / 2) * Math.sin(dLng / 2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                const distance = earthRadiusKm * c;

                return { ...rsa, distance };
            })
            .filter((rsa: any) => rsa.distance <= radiusKm)
            .sort((a: any, b: any) => a.distance - b.distance)
            .slice(0, limit);

        return matchingRSAs;
    }

    private toRad(deg: number): number {
        return deg * (Math.PI / 180);
    }

    // =============================================
    // RSA Job Management
    // =============================================

    async createJob(data: {
        clientId: string;
        vehicleId: string;
        serviceType: string;
        pickupLat: number;
        pickupLng: number;
        pickupAddress?: string;
        destinationLat?: number;
        destinationLng?: number;
        destinationAddress?: string;
        destinationWorkshopId?: string;
    }) {
        const id = uuid();
        const [job] = await this.db.insert(rsaJobs).values({
            id,
            clientId: data.clientId,
            vehicleId: data.vehicleId,
            serviceType: data.serviceType as any,
            status: 'REQUESTED' as any,
            pickupLat: data.pickupLat,
            pickupLng: data.pickupLng,
            pickupAddress: data.pickupAddress,
            destinationLat: data.destinationLat,
            destinationLng: data.destinationLng,
            destinationAddress: data.destinationAddress,
            destinationWorkshopId: data.destinationWorkshopId,
        }).returning();
        return job;
    }

    async getJobById(id: string) {
        const job = await this.db.query.rsaJobs.findFirst({
            where: eq(rsaJobs.id, id),
            with: {
                client: true,
                rsa: true,
                vehicle: { with: { variant: { with: { model: { with: { make: true } } } } } },
                destinationWorkshop: true,
            },
        });
        if (!job) throw new NotFoundException('RSA job not found');
        return job;
    }

    async getJobsByRSA(rsaId: string, status?: string) {
        const conditions = [eq(rsaJobs.rsaId, rsaId)];
        if (status) {
            conditions.push(eq(rsaJobs.status, status as any));
        }
        return await this.db.query.rsaJobs.findMany({
            where: and(...conditions),
            with: {
                client: true,
                vehicle: { with: { variant: { with: { model: { with: { make: true } } } } } },
            },
            orderBy: [desc(rsaJobs.createdAt)],
        });
    }

    async getJobsByClient(clientId: string) {
        return await this.db.query.rsaJobs.findMany({
            where: eq(rsaJobs.clientId, clientId),
            with: {
                rsa: true,
                vehicle: { with: { variant: { with: { model: { with: { make: true } } } } } },
            },
            orderBy: [desc(rsaJobs.createdAt)],
        });
    }

    async getPendingJobs() {
        return await this.db.query.rsaJobs.findMany({
            where: eq(rsaJobs.status, 'REQUESTED'),
            with: {
                client: true,
                vehicle: { with: { variant: { with: { model: { with: { make: true } } } } } },
            },
            orderBy: [desc(rsaJobs.createdAt)],
        });
    }

    async acceptJob(jobId: string, rsaId: string) {
        const job = await this.getJobById(jobId);
        if (job.status !== 'REQUESTED') {
            throw new BadRequestException('Job is not in requested status');
        }

        const [updated] = await this.db.update(rsaJobs)
            .set({
                rsaId,
                status: 'ACCEPTED' as any,
                acceptedAt: new Date().toISOString(),
            })
            .where(eq(rsaJobs.id, jobId))
            .returning();
        return updated;
    }

    async updateJobStatus(jobId: string, rsaId: string, status: string) {
        const job = await this.getJobById(jobId);
        if (job.rsaId !== rsaId) {
            throw new ForbiddenException('You are not assigned to this job');
        }

        const validTransitions: Record<string, string[]> = {
            'ACCEPTED': ['ON_THE_WAY', 'CANCELLED'],
            'ON_THE_WAY': ['ARRIVED', 'CANCELLED'],
            'ARRIVED': ['IN_PROGRESS', 'CANCELLED'],
            'IN_PROGRESS': ['COMPLETED', 'CANCELLED'],
        };

        if (!validTransitions[job.status]?.includes(status)) {
            throw new BadRequestException(`Invalid status transition from ${job.status} to ${status}`);
        }

        const updateData: any = { status };
        if (status === 'COMPLETED') {
            updateData.completedAt = new Date().toISOString();
        } else if (status === 'CANCELLED') {
            updateData.cancelledAt = new Date().toISOString();
        }

        const [updated] = await this.db.update(rsaJobs)
            .set(updateData)
            .where(eq(rsaJobs.id, jobId))
            .returning();
        return updated;
    }

    async completeJob(jobId: string, rsaId: string, fare?: number, distanceKm?: number) {
        const job = await this.getJobById(jobId);
        if (job.rsaId !== rsaId) {
            throw new ForbiddenException('You are not assigned to this job');
        }
        if (job.status !== 'IN_PROGRESS') {
            throw new BadRequestException('Job must be in progress to complete');
        }

        // Update job status
        const [updated] = await this.db.update(rsaJobs)
            .set({
                status: 'COMPLETED' as any,
                completedAt: new Date().toISOString(),
                fare,
                distanceKm,
            })
            .where(eq(rsaJobs.id, jobId))
            .returning();

        // AUTO-CREATE Vehicle Service History
        await this.db.insert(vehicleServiceHistory).values({
            id: uuid(),
            vehicleId: job.vehicleId,
            serviceType: `RSA_${job.serviceType}`,
            performedBy: 'RSA',
            rsaJobId: jobId,
            rsaProfileId: rsaId,
            notes: `RSA ${job.serviceType} service completed`,
            serviceDate: new Date().toISOString(),
        });

        // Increment RSA total jobs
        await this.db.update(rsaProfiles)
            .set({
                totalJobs: sql`${rsaProfiles.totalJobs} + 1`,
                updatedAt: new Date().toISOString(),
            })
            .where(eq(rsaProfiles.id, rsaId));

        return updated;
    }

    async cancelJob(jobId: string, userId: string, reason?: string) {
        const job = await this.getJobById(jobId);

        // Both client and RSA can cancel
        if (job.clientId !== userId && job.rsaId !== userId) {
            throw new ForbiddenException('You cannot cancel this job');
        }

        if (['COMPLETED', 'CANCELLED'].includes(job.status)) {
            throw new BadRequestException('Job is already completed or cancelled');
        }

        const [updated] = await this.db.update(rsaJobs)
            .set({
                status: 'CANCELLED' as any,
                cancelledAt: new Date().toISOString(),
                cancellationReason: reason,
            })
            .where(eq(rsaJobs.id, jobId))
            .returning();
        return updated;
    }

    // =============================================
    // Public Workshop Nearby API
    // =============================================

    async getNearbyWorkshops(lat: number, lng: number, radiusKm: number = 10) {
        const allWorkshops = await this.db.query.workshops.findMany({
            where: eq(workshops.isActive, true),
        });

        const earthRadiusKm = 6371;
        const nearbyWorkshops = allWorkshops
            .filter((ws: any) => ws.latitude && ws.longitude)
            .map((ws: any) => {
                const dLat = this.toRad(ws.latitude - lat);
                const dLng = this.toRad(ws.longitude - lng);
                const a =
                    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(this.toRad(lat)) * Math.cos(this.toRad(ws.latitude)) *
                    Math.sin(dLng / 2) * Math.sin(dLng / 2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                const distance = earthRadiusKm * c;

                return {
                    id: ws.id,
                    name: ws.businessName,
                    address: ws.address,
                    lat: ws.latitude,
                    lng: ws.longitude,
                    phone: ws.phone,
                    distance: Math.round(distance * 10) / 10, // Round to 1 decimal
                };
            })
            .filter((ws: any) => ws.distance <= radiusKm)
            .sort((a: any, b: any) => a.distance - b.distance);

        return nearbyWorkshops;
    }

    // =============================================
    // Vehicle Service History
    // =============================================

    async getVehicleServiceHistory(vehicleId: string) {
        return await this.db.query.vehicleServiceHistory.findMany({
            where: eq(vehicleServiceHistory.vehicleId, vehicleId),
            with: {
                rsaJob: { with: { rsa: true } },
                jobCard: true,
                workshop: true,
            },
            orderBy: [desc(vehicleServiceHistory.serviceDate)],
        });
    }

    // =============================================
    // Admin - All Jobs
    // =============================================

    async getAllJobs(filters?: { status?: string; rsaId?: string }) {
        const conditions = [];
        if (filters?.status) {
            conditions.push(eq(rsaJobs.status, filters.status as any));
        }
        if (filters?.rsaId) {
            conditions.push(eq(rsaJobs.rsaId, filters.rsaId));
        }

        return await this.db.query.rsaJobs.findMany({
            where: conditions.length > 0 ? and(...conditions) : undefined,
            with: {
                client: true,
                rsa: true,
                vehicle: { with: { variant: { with: { model: { with: { make: true } } } } } },
                destinationWorkshop: true,
            },
            orderBy: [desc(rsaJobs.createdAt)],
        });
    }
}
