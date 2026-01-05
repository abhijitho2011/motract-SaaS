import { Injectable, Inject, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { eq, and, desc, sql, isNull, asc } from 'drizzle-orm';
import * as schema from '../drizzle/schema';
import { v4 as uuid } from 'uuid';
import { DrizzleAsyncProvider } from '../drizzle/drizzle.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as bcrypt from 'bcrypt';

const { users, vehicles, clientVehicles, vehicleServiceHistory, workshopBookings, workshops, serviceCategories, workshopBays, workshopBaySlots, workshopRatings } = schema;

@Injectable()
export class ClientService {
    constructor(
        @Inject(DrizzleAsyncProvider)
        private db: NodePgDatabase<typeof schema>,
    ) { }

    // =============================================
    // Client Registration
    // =============================================

    async registerClient(data: {
        name: string;
        email: string;
        mobile: string;
        password: string;
    }) {
        // Check if user already exists
        const existingEmail = await this.db.query.users.findFirst({
            where: eq(users.email, data.email),
        });
        if (existingEmail) {
            throw new ConflictException('Email already registered');
        }

        const existingMobile = await this.db.query.users.findFirst({
            where: eq(users.mobile, data.mobile),
        });
        if (existingMobile) {
            throw new ConflictException('Mobile number already registered');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(data.password, 10);

        // Create user with CLIENT role
        const id = uuid();
        const [newUser] = await this.db.insert(users).values({
            id,
            name: data.name,
            email: data.email,
            mobile: data.mobile,
            password: hashedPassword,
            role: 'CLIENT' as any,
            updatedAt: new Date().toISOString(),
        }).returning();

        // Return user without password
        const { password, ...userWithoutPassword } = newUser;
        return userWithoutPassword;
    }

    // =============================================
    // Vehicle Management
    // =============================================

    // Find vehicle by registration number
    async findVehicleByRegNumber(regNumber: string) {
        const results = await this.db.select()
            .from(vehicles)
            .where(eq(vehicles.regNumber, regNumber.toUpperCase()))
            .limit(1);
        return results[0] || null;
    }

    // Check if vehicle already linked to client
    async isVehicleLinkedToClient(clientId: string, vehicleId: string): Promise<boolean> {
        const results = await this.db.select()
            .from(clientVehicles)
            .where(and(
                eq(clientVehicles.clientId, clientId),
                eq(clientVehicles.vehicleId, vehicleId)
            ))
            .limit(1);
        return results.length > 0;
    }

    // Add vehicle to client dashboard
    async addVehicleToClient(clientId: string, regNumber: string) {
        // Find vehicle by reg number
        const vehicle = await this.findVehicleByRegNumber(regNumber);

        if (!vehicle) {
            throw new NotFoundException(`No vehicle found with registration number: ${regNumber}`);
        }

        // Check if already linked
        const alreadyLinked = await this.isVehicleLinkedToClient(clientId, vehicle.id);
        if (alreadyLinked) {
            throw new ConflictException('Vehicle already added to your dashboard');
        }

        // Check if VIN verification is needed (vehicle exists in database)
        return {
            vehicleId: vehicle.id,
            needsVinVerification: true,
            vehicle: {
                id: vehicle.id,
                regNumber: vehicle.regNumber,
                make: null, // Would need separate query to get make info
                model: null,
                variant: null,
                fuelType: null,
            }
        };
    }

    // Verify VIN and link vehicle to client
    async verifyVinAndLinkVehicle(clientId: string, vehicleId: string, vinNumber: string) {
        const results = await this.db.select()
            .from(vehicles)
            .where(eq(vehicles.id, vehicleId))
            .limit(1);
        const vehicle = results[0];

        if (!vehicle) {
            throw new NotFoundException('Vehicle not found');
        }

        // Check VIN match (case-insensitive)
        if (vehicle.vin?.toLowerCase() !== vinNumber.toLowerCase()) {
            throw new BadRequestException('VIN number does not match. Please check and try again.');
        }

        // Check if already linked
        const alreadyLinked = await this.isVehicleLinkedToClient(clientId, vehicleId);
        if (alreadyLinked) {
            throw new ConflictException('Vehicle already added to your dashboard');
        }

        // Link vehicle to client
        const id = uuid();
        try {
            console.log('Attempting to insert clientVehicle:', { id, clientId, vehicleId });
            const [link] = await this.db.insert(clientVehicles).values({
                id,
                clientId,
                vehicleId,
            }).returning();

            console.log('Successfully inserted clientVehicle:', link);
            return {
                success: true,
                message: 'Vehicle successfully added to your dashboard',
                link
            };
        } catch (error) {
            console.error('Error inserting clientVehicle:', error);
            throw error;
        }
    }

    // Get all vehicles linked to client
    async getClientVehicles(clientId: string) {
        // Get client vehicle links with vehicle data using join
        const results = await this.db.select({
            linkId: clientVehicles.id,
            addedAt: clientVehicles.addedAt,
            vehicleId: vehicles.id,
            regNumber: vehicles.regNumber,
            variantId: vehicles.variantId,
        })
            .from(clientVehicles)
            .innerJoin(vehicles, eq(clientVehicles.vehicleId, vehicles.id))
            .where(eq(clientVehicles.clientId, clientId));

        return results.map(r => ({
            id: r.vehicleId,
            regNumber: r.regNumber,
            make: null, // Will be fetched separately if needed
            model: null,
            variant: null,
            fuelType: null,
            addedAt: r.addedAt,
        }));
    }

    // =============================================
    // Service History
    // =============================================

    async getVehicleServiceHistory(clientId: string, vehicleId: string) {
        // First verify client owns this vehicle
        const isLinked = await this.isVehicleLinkedToClient(clientId, vehicleId);
        if (!isLinked) {
            throw new BadRequestException('You do not have access to this vehicle');
        }

        // Get service history
        const history = await this.db.query.vehicleServiceHistory.findMany({
            where: eq(vehicleServiceHistory.vehicleId, vehicleId),
            with: {
                workshop: true,
                rsaProfile: true,
                rsaJob: true,
                jobCard: true,
            },
            orderBy: desc(vehicleServiceHistory.serviceDate)
        });

        return history.map(record => ({
            id: record.id,
            serviceType: record.serviceType,
            performedBy: record.performedBy,
            workshopName: record.workshop?.name,
            rsaProviderName: record.rsaProfile?.name,
            notes: record.notes,
            serviceDate: record.serviceDate,
            createdAt: record.createdAt,
        }));
    }

    // =============================================
    // Workshop Booking
    // =============================================

    async getWorkshopCategories() {
        // Get distinct subCategories from organizations with WORKSHOP accountType
        const orgs = await this.db.select({
            category: schema.organizations.subCategory
        })
            .from(schema.organizations)
            .where(eq(schema.organizations.accountType, 'WORKSHOP' as any));

        // Return unique categories
        const uniqueCategories = [...new Set(orgs.map(o => o.category).filter(Boolean))];
        return uniqueCategories.map(cat => ({ id: cat, name: cat }));
    }

    async searchWorkshops(categoryId?: string, query?: string, lat?: number, lng?: number) {
        // Get workshops
        const workshopList = await this.db.select().from(workshops);

        // Filter by name if query provided
        let filtered = workshopList;
        if (query) {
            const lowerQuery = query.toLowerCase();
            filtered = workshopList.filter(w =>
                w.name?.toLowerCase().includes(lowerQuery)
            );
        }

        return filtered.map(w => ({
            id: w.id,
            name: w.name,
            address: w.address,
            phone: w.mobile,
            lat: w.latitude,
            lng: w.longitude,
        }));
    }

    async getWorkshopSlots(workshopId: string, date: string) {
        // Get workshop operating hours (default 9AM-6PM)
        // For now, return standard slots
        const slots = [];
        for (let hour = 9; hour < 18; hour++) {
            const startTime = `${hour.toString().padStart(2, '0')}:00`;
            const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
            slots.push({
                time: `${startTime}-${endTime}`,
                available: true, // In real implementation, check existing bookings
            });
        }
        return slots;
    }

    async createWorkshopBooking(clientId: string, data: {
        workshopId: string;
        vehicleId: string;
        serviceCategories: string[];
        bookingDate: string;
        slotTime: string;
        notes?: string;
    }) {
        // Verify client owns vehicle
        const isLinked = await this.isVehicleLinkedToClient(clientId, data.vehicleId);
        if (!isLinked) {
            throw new BadRequestException('You do not have access to this vehicle');
        }

        // Create booking
        const id = uuid();
        const [booking] = await this.db.insert(workshopBookings).values({
            id,
            clientId,
            workshopId: data.workshopId,
            vehicleId: data.vehicleId,
            serviceCategories: data.serviceCategories as any,
            bookingDate: data.bookingDate,
            slotTime: data.slotTime,
            notes: data.notes,
            status: 'PENDING' as any,
            updatedAt: new Date().toISOString(),
        }).returning();

        return booking;
    }

    async getClientBookings(clientId: string) {
        // Use simple select to avoid relation issues
        const bookings = await this.db.select()
            .from(workshopBookings)
            .where(eq(workshopBookings.clientId, clientId));

        return bookings.map(b => ({
            id: b.id,
            workshopId: b.workshopId,
            vehicleId: b.vehicleId,
            serviceCategories: b.serviceCategories,
            bookingDate: b.bookingDate,
            slotTime: b.slotTime,
            status: b.status,
            notes: b.notes,
            createdAt: b.createdAt,
        }));
    }

    // =============================================
    // Enhanced Booking System
    // =============================================

    // Get all service categories
    async getAllServiceCategories() {
        const categories = await this.db.select()
            .from(serviceCategories);
        return categories;
    }

    // Get nearby workshops with ratings (location-based)
    async getNearbyWorkshopsWithRatings(lat: number, lng: number, categoryId?: string) {
        // Get all active workshops with their average ratings
        const workshopsData = await this.db.select({
            id: workshops.id,
            name: workshops.name,
            address: workshops.address,
            city: workshops.city,
            mobile: workshops.mobile,
            latitude: workshops.latitude,
            longitude: workshops.longitude,
            workingStartHour: workshops.workingStartHour,
            workingEndHour: workshops.workingEndHour,
        })
            .from(workshops)
            .where(eq(workshops.isActive, true));

        // Calculate distance and get ratings for each workshop
        const workshopsWithDetails = await Promise.all(workshopsData.map(async (ws) => {
            // Calculate distance using Haversine formula (simplified)
            const distance = ws.latitude && ws.longitude
                ? this.calculateDistance(lat, lng, ws.latitude, ws.longitude)
                : null;

            // Get average rating
            const ratingsResult = await this.db.select({
                avgRating: sql<number>`COALESCE(AVG(${workshopRatings.rating}), 0)`,
                totalRatings: sql<number>`COUNT(${workshopRatings.id})::int`,
            })
                .from(workshopRatings)
                .where(eq(workshopRatings.workshopId, ws.id));

            return {
                ...ws,
                distance: distance ? Math.round(distance * 10) / 10 : null, // km with 1 decimal
                avgRating: ratingsResult[0]?.avgRating || 0,
                totalRatings: ratingsResult[0]?.totalRatings || 0,
            };
        }));

        // Sort by distance
        return workshopsWithDetails
            .filter(ws => ws.distance !== null)
            .sort((a, b) => (a.distance || 999) - (b.distance || 999));
    }

    // Helper: Calculate distance using Haversine formula
    private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
        const R = 6371; // Earth's radius in km
        const dLat = this.toRad(lat2 - lat1);
        const dLng = this.toRad(lng2 - lng1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private toRad(deg: number): number {
        return deg * (Math.PI / 180);
    }

    // Get available slots for a workshop on a specific date
    async getAvailableSlots(workshopId: string, date: string, serviceCategoryId?: string) {
        // Get workshop's bays
        const bays = await this.db.select()
            .from(workshopBays)
            .where(and(
                eq(workshopBays.workshopId, workshopId),
                eq(workshopBays.isActive, true)
            ));

        if (bays.length === 0) {
            // No bays configured - generate default slots from workshop hours
            const workshopData = await this.db.select()
                .from(workshops)
                .where(eq(workshops.id, workshopId))
                .limit(1);

            if (!workshopData[0]) return [];

            const ws = workshopData[0];
            return this.generateDefaultSlots(ws.workingStartHour, ws.workingEndHour, ws.slotDurationMin);
        }

        // Get slots for all bays on the given date
        const slotsData = await this.db.select({
            slotId: workshopBaySlots.id,
            bayId: workshopBaySlots.bayId,
            startTime: workshopBaySlots.startTime,
            endTime: workshopBaySlots.endTime,
            status: workshopBaySlots.status,
            bayName: workshopBays.name,
        })
            .from(workshopBaySlots)
            .innerJoin(workshopBays, eq(workshopBaySlots.bayId, workshopBays.id))
            .where(and(
                eq(workshopBaySlots.date, date),
                eq(workshopBays.workshopId, workshopId)
            ))
            .orderBy(asc(workshopBaySlots.startTime));

        // Group by time slot for movie-ticket style display
        const slotMap = new Map<string, { time: string, slots: any[] }>();
        for (const slot of slotsData) {
            const timeKey = `${slot.startTime}-${slot.endTime}`;
            if (!slotMap.has(timeKey)) {
                slotMap.set(timeKey, { time: timeKey, slots: [] });
            }
            slotMap.get(timeKey)!.slots.push({
                slotId: slot.slotId,
                bayId: slot.bayId,
                bayName: slot.bayName,
                status: slot.status,
            });
        }

        return Array.from(slotMap.values());
    }

    // Generate default time slots based on workshop hours
    private generateDefaultSlots(startHour: string, endHour: string, durationMin: number) {
        const slots = [];
        const [startH, startM] = startHour.split(':').map(Number);
        const [endH, endM] = endHour.split(':').map(Number);

        let current = startH * 60 + startM;
        const end = endH * 60 + endM;

        while (current + durationMin <= end) {
            const startTimeH = Math.floor(current / 60).toString().padStart(2, '0');
            const startTimeM = (current % 60).toString().padStart(2, '0');
            const endTimeH = Math.floor((current + durationMin) / 60).toString().padStart(2, '0');
            const endTimeM = ((current + durationMin) % 60).toString().padStart(2, '0');

            slots.push({
                time: `${startTimeH}:${startTimeM}-${endTimeH}:${endTimeM}`,
                slots: [{ slotId: null, bayId: null, bayName: 'Default', status: 'AVAILABLE' }]
            });

            current += durationMin;
        }

        return slots;
    }

    // Create booking with slot reservation
    async createBookingWithSlot(clientId: string, data: {
        workshopId: string;
        vehicleId: string;
        serviceCategoryId: string;
        date: string;
        slotTime: string;
        slotId?: string; // Optional if using pre-configured slots
        notes?: string;
    }) {
        const bookingId = uuid();

        // Create the booking
        const [booking] = await this.db.insert(workshopBookings).values({
            id: bookingId,
            clientId,
            workshopId: data.workshopId,
            vehicleId: data.vehicleId,
            serviceCategories: [data.serviceCategoryId],
            bookingDate: data.date,
            slotTime: data.slotTime,
            status: 'PENDING' as any,
            notes: data.notes,
            updatedAt: new Date().toISOString(),
        }).returning();

        // If a specific slot ID was provided, mark it as booked
        if (data.slotId) {
            await this.db.update(workshopBaySlots)
                .set({
                    bookingId: bookingId,
                    status: 'BOOKED' as any
                })
                .where(eq(workshopBaySlots.id, data.slotId));
        }

        return {
            success: true,
            message: 'Booking created successfully',
            booking,
        };
    }

    // Submit rating for a workshop after service
    async submitWorkshopRating(clientId: string, bookingId: string, rating: number, feedback?: string) {
        // Get the booking to verify ownership and get workshop ID
        const [booking] = await this.db.select()
            .from(workshopBookings)
            .where(and(
                eq(workshopBookings.id, bookingId),
                eq(workshopBookings.clientId, clientId)
            ))
            .limit(1);

        if (!booking) {
            throw new NotFoundException('Booking not found');
        }

        // Check if already rated
        const existingRating = await this.db.select()
            .from(workshopRatings)
            .where(eq(workshopRatings.bookingId, bookingId))
            .limit(1);

        if (existingRating.length > 0) {
            throw new ConflictException('You have already rated this service');
        }

        // Create the rating
        const [newRating] = await this.db.insert(workshopRatings).values({
            id: uuid(),
            workshopId: booking.workshopId,
            clientId,
            bookingId,
            rating,
            feedback,
        }).returning();

        return {
            success: true,
            message: 'Thank you for your feedback!',
            rating: newRating,
        };
    }
}

