import { Injectable, Inject, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { eq, and, desc } from 'drizzle-orm';
import * as schema from '../drizzle/schema';
import { v4 as uuid } from 'uuid';
import { DrizzleAsyncProvider } from '../drizzle/drizzle.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as bcrypt from 'bcrypt';

const { users, vehicles, clientVehicles, vehicleServiceHistory, workshopBookings, workshops } = schema;

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
        const bookings = await this.db.query.workshopBookings.findMany({
            where: eq(workshopBookings.clientId, clientId),
            with: {
                workshop: true,
                vehicle: {
                    with: {
                        variant: {
                            with: {
                                model: {
                                    with: {
                                        make: true
                                    }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: desc(workshopBookings.createdAt)
        });

        return bookings.map(b => ({
            id: b.id,
            workshopName: b.workshop?.name,
            vehicleRegNumber: b.vehicle?.regNumber,
            vehicleName: `${b.vehicle?.variant?.model?.make?.name} ${b.vehicle?.variant?.model?.name}`,
            serviceCategories: b.serviceCategories,
            bookingDate: b.bookingDate,
            slotTime: b.slotTime,
            status: b.status,
            notes: b.notes,
            createdAt: b.createdAt,
        }));
    }
}
