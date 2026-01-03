import {
  Injectable,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { DrizzleAsyncProvider } from '../drizzle/drizzle.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../drizzle/schema';
import {
  jobCards,
  vehicles,
  customers,
  jobComplaints,
  jobInspections,
  jobItems,
  jobParts,
  users,
} from '../drizzle/schema';
import { eq, and, desc } from 'drizzle-orm'; // Added desc for ordering
import { JobStage, JobPriority } from '../drizzle/types';
import * as crypto from 'crypto';

@Injectable()
export class JobCardService {
  constructor(
    @Inject(DrizzleAsyncProvider)
    private db: NodePgDatabase<typeof schema>,
  ) { }

  async create(data: {
    workshopId: string;
    vehicleId: string;
    customerName: string;
    customerMobile: string;
    advisorId?: string; // Optional
    odometer?: number;
    fuelLevel?: number;
    complaints?: string[];
    priority?: JobPriority;
    notes?: string; // Added notes to match controller usage if needed, though service def didn't have it explicitly in arg type in previous file view? 
    // Wait, recent controller view showed notes passed. Previous file view of service showed arg type without notes?
    // Step 5346 showed create args: { ... complaints?: string[]; priority?: JobPriority; }
    // It did NOT show notes. I will stick to signature from file view unless I see otherwise.
    // Controller Step 5188 showed 'notes': notes passed to createJobCard.
    // So the service MUST accept notes or it's ignored.
    // I'll add notes?: string to be safe.
  }) {
    // 1. Find Vehicle
    const vehicle = await this.db.query.vehicles.findFirst({
      where: eq(vehicles.id, data.vehicleId),
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found.');
    }

    // 2. Find or Create Customer
    // Upsert logic
    let customer = await this.db.query.customers.findFirst({
      where: and(eq(customers.workshopId, data.workshopId), eq(customers.mobile, data.customerMobile))
    });

    if (customer) {
      // Update name
      const [updated] = await this.db.update(customers)
        .set({ name: data.customerName })
        .where(eq(customers.id, customer.id))
        .returning();
      customer = updated;
    } else {
      const [created] = await this.db.insert(customers).values({
        id: crypto.randomUUID(),
        workshopId: data.workshopId,
        name: data.customerName,
        mobile: data.customerMobile,
        updatedAt: new Date().toISOString(),
      }).returning();
      customer = created;
    }

    // 3. Generate Job Card Number
    const lastJobCard = await this.db.query.jobCards.findFirst({
      where: eq(jobCards.workshopId, data.workshopId),
      orderBy: [desc(jobCards.createdAt)],
    });

    const year = new Date().getFullYear();
    const lastNumber = lastJobCard?.jobCardNumber
      ? parseInt(lastJobCard.jobCardNumber.split('-').pop() || '0')
      : 0;
    const jobCardNumber = `JC-${year}-${String(lastNumber + 1).padStart(4, '0')}`;

    // 4. Create Job Card
    const jobCardId = crypto.randomUUID();
    const [jobCard] = await this.db.insert(jobCards).values({
      id: jobCardId,
      workshopId: data.workshopId,
      vehicleId: vehicle.id,
      customerId: customer.id,
      advisorId: data.advisorId || null,
      jobCardNumber: jobCardNumber,
      odometer: data.odometer,
      fuelLevel: data.fuelLevel,
      priority: data.priority || 'NORMAL',
      stage: 'CREATED',
      createdAt: new Date().toISOString(), // Drizzle timestamp string
      updatedAt: new Date().toISOString(),
    }).returning();

    // 5. Create Complaints
    if (data.complaints && data.complaints.length > 0) {
      await this.db.insert(jobComplaints).values(
        data.complaints.map(c => ({
          id: crypto.randomUUID(),
          jobCardId: jobCardId,
          complaint: c,
        }))
      );
    }

    // Return with includes
    // Drizzle doesn't return with query on insert easily. Fetch again.
    return this.findOne(jobCardId);
  }

  async findAll(workshopId: string) {
    return this.db.query.jobCards.findMany({
      where: eq(jobCards.workshopId, workshopId),
      with: {
        vehicle: {
          with: {
            variant: { with: { model: { with: { make: true } } } },
          },
        },
        customer: true,
      },
      orderBy: [desc(jobCards.updatedAt)],
    });
  }

  async findOne(id: string) {
    const jobCard = await this.db.query.jobCards.findFirst({
      where: eq(jobCards.id, id),
      with: {
        vehicle: {
          with: {
            variant: { with: { model: { with: { make: true } } } },
          },
        },
        customer: true,
        jobComplaints: true,
        jobInspections: true, // Note relation name singular/plural check? Schema has 'jobInspections'
        jobItems: true, // tasks
        jobParts: { with: { inventoryItem: true } },
        invoices: true,
      },
    });

    if (!jobCard) throw new NotFoundException('Job Card not found');

    // Remap if necessary to match exact structure expected by frontend?
    // Drizzle returns { jobInspections: [...] } (array) but Prisma might have returned singular if relation is one-to-one?
    // Schema relation: jobInspections is MANY.
    // Wait, validation in dashboard/app expects `inspection` (singular)?
    // `JobCardService` `findOne` (Step 5346) had `inspection: true`.
    // In Prisma schema: `inspection JobInspection?`. Relation ONE to ONE?
    // Let's check schema.prisma (Step 5237):
    // `model JobInspection { ... jobCardId String @unique ... }`. Yes it is Unique.
    // Drizzle `relations.ts` (Step 5340):
    // `export const jobCardsRelations = ... jobInspections: many(jobInspections) ...`
    // Drizzle introspection inferred MANY because it missed the unique constraint on the foreign key column?
    // Actually, SQL `uniqueIndex("job_inspections_jobCardId_key")` is present in `schema.ts`.
    // But `relations` definition says `many`.
    // I should fix relations.ts or handle array.
    // I'll handle array -> single object mapping here.
    const res: any = { ...jobCard };
    if (res.jobInspections && res.jobInspections.length > 0) {
      res.inspection = res.jobInspections[0];
    } else {
      res.inspection = null;
    }
    // Map invoices array to singular invoice
    res.invoice = res.invoices?.[0] ?? null;
    // Rename jobItems to tasks if frontend expects tasks
    // Prisma `tasks: true`? Prisma schema has `tasks JobItem[]`.
    // Drizzle `jobItems`.
    res.tasks = res.jobItems;

    // Prisma `parts: { include: { item: true } }` -> `parts`
    // Drizzle `jobParts` -> rename to `parts`
    // Item relation: Drizzle `inventoryItem`. Prisma `item`.
    res.parts = res.jobParts.map((p: any) => ({
      ...p,
      item: p.inventoryItem
    }));

    return res;
  }

  async updateStage(id: string, stage: JobStage) {
    return this.db.update(jobCards)
      .set({ stage })
      .where(eq(jobCards.id, id))
      .returning();
  }

  async saveInspection(
    jobCardId: string,
    data: {
      exterior: any;
      interior: any;
      tyres: any;
      battery?: string;
      documents?: any;
      photos: string[];
      fuelLevel?: number;
      odometer?: number;
    },
  ) {
    // 1. Upsert Inspection
    // Check existence
    let inspection = await this.db.query.jobInspections.findFirst({
      where: eq(jobInspections.jobCardId, jobCardId)
    });

    const values = {
      exterior: data.exterior,
      interior: data.interior,
      tyres: data.tyres,
      battery: data.battery,
      documents: data.documents,
      photos: data.photos,
    };

    if (inspection) {
      await this.db.update(jobInspections)
        .set(values)
        .where(eq(jobInspections.id, inspection.id));
    } else {
      await this.db.insert(jobInspections).values({
        id: crypto.randomUUID(),
        jobCardId,
        ...values
      });
    }

    // 2. Update Job Card
    await this.db.update(jobCards)
      .set({
        fuelLevel: data.fuelLevel,
        odometer: data.odometer,
        stage: 'ESTIMATE' // JobStage.ESTIMATE
      })
      .where(eq(jobCards.id, jobCardId));

    return this.findOne(jobCardId); // Return full object
  }

  async addTask(
    jobCardId: string,
    data: {
      description: string;
      price: number;
      gst: number;
    },
  ) {
    return this.db.insert(jobItems).values({
      id: crypto.randomUUID(),
      jobCardId,
      description: data.description,
      price: data.price,
      gstPercent: data.gst,
      isApproved: false,
    }).returning();
  }

  async addPart(
    jobCardId: string,
    data: {
      itemId: string;
      quantity: number;
      unitPrice: number;
      gst: number;
    },
  ) {
    const [part] = await this.db.insert(jobParts).values({
      id: crypto.randomUUID(),
      jobCardId,
      itemId: data.itemId,
      quantity: data.quantity,
      unitPrice: data.unitPrice,
      gstPercent: data.gst,
      totalPrice: data.quantity * data.unitPrice * (1 + data.gst / 100),
      isApproved: false,
    }).returning();

    // Need to return with item included?
    // Prisma: include: { item: true }
    // Fetch again
    const p = await this.db.query.jobParts.findFirst({
      where: eq(jobParts.id, part.id),
      with: { inventoryItem: true }
    });
    // Remap
    return { ...p, item: (p as any).inventoryItem };
  }

  async assignTechnician(id: string, technicianId: string) {
    return this.db.update(jobCards)
      .set({ technicianId })
      .where(eq(jobCards.id, id))
      .returning();
  }

  async updateTaskStatus(jobCardId: string, taskId: string, status: string) {
    return this.db.update(jobItems)
      .set({ completionStatus: status })
      .where(eq(jobItems.id, taskId))
      .returning();
  }
}
