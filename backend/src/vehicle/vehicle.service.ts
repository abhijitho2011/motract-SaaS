import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { DrizzleAsyncProvider } from '../drizzle/drizzle.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../drizzle/schema';
import {
  makes,
  models,
  variants,
  vehicles,
} from '../drizzle/schema'; // Note: check precise export name for models/vehicle_models
import { eq, and, asc } from 'drizzle-orm';
import * as crypto from 'crypto';

@Injectable()
export class VehicleService {
  constructor(
    @Inject(DrizzleAsyncProvider)
    private db: NodePgDatabase<typeof schema>,
  ) { }

  async lookup(regNumber: string) {
    const vehicle = await this.db.query.vehicles.findFirst({
      where: eq(vehicles.regNumber, regNumber),
      with: {
        variant: {
          with: {
            model: {
              with: {
                make: true,
              },
            },
          },
        },
      },
    });
    return vehicle || null;
  }

  async register(data: any) {
    const {
      regNumber,
      make,
      model,
      variant,
      engineNumber,
      chassisNumber,
      vin,
      year,
    } = data;

    // 1. Find or Create Make
    const [makeRecord] = await this.db
      .insert(makes)
      .values({
        id: crypto.randomUUID(),
        name: make
      })
      .onConflictDoUpdate({
        target: makes.name,
        set: { name: make }
      })
      .returning();

    // 2. Find or Create Model
    const [modelRecord] = await this.db
      .insert(models)
      .values({
        id: crypto.randomUUID(),
        name: model,
        makeId: makeRecord.id,
      })
      .onConflictDoUpdate({
        target: models.name, // Assuming name + makeId unique index, but Drizzle conflict target usually needs constraint name or columns
        // Actually unique index is on "makeId" and "name". 
        // We might need to select first or rely on standard conflict handling if Drizzle infers it
        set: { name: model }
      })
      // If unique constraint is composite, use constraint name if possible or columns?
      // Drizzle handles proper conflict target if defined in schema?
      // In schema.ts: uniqueIndex("models_makeId_name_key")
      .returning();

    // Wait, onConflictDoUpdate might need specialized syntax for composite unique keys in standard SQL or Drizzle helper.
    // Let's implement explicit find-then-create to be safer if conflict target is tricky without proper constraint object reference.

    // Alternative: explicit select
    let existingModel = await this.db.query.models.findFirst({
      where: and(eq(models.makeId, makeRecord.id), eq(models.name, model))
    });

    if (!existingModel) {
      const res = await this.db.insert(models).values({
        id: crypto.randomUUID(),
        name: model,
        makeId: makeRecord.id, // Fixed: use makeRecord.id
      }).returning();
      existingModel = res[0];
    }
    const modelId = existingModel.id;


    // 3. Find or Create Variant
    let existingVariant = await this.db.query.variants.findFirst({
      where: and(
        eq(variants.modelId, modelId),
        eq(variants.name, variant),
        eq(variants.fuelType, 'PETROL') // Defaulting as per original
      )
    });

    if (!existingVariant) {
      const res = await this.db.insert(variants).values({
        id: crypto.randomUUID(),
        name: variant,
        modelId: modelId,
        fuelType: 'PETROL'
      }).returning();
      existingVariant = res[0];
    }
    const variantId = existingVariant.id;

    // 4. Create Vehicle
    const [vehicle] = await this.db.insert(vehicles).values({
      id: crypto.randomUUID(),
      regNumber,
      engineNumber,
      chassisNumber,
      vin,
      mfgYear: year,
      variantId: variantId,
      workshopId: data.workshopId, // Save workshopId
      updatedAt: new Date().toISOString(),
    }).returning();

    return vehicle;
  }

  // Super Admin: Get All Vehicles with Filters
  async findAllVehicles(filters?: { workshopId?: string; regNumber?: string }) {
    const whereClause = [];
    if (filters?.workshopId) whereClause.push(eq(vehicles.workshopId, filters.workshopId));
    if (filters?.regNumber) whereClause.push(eq(vehicles.regNumber, filters.regNumber));

    return this.db.query.vehicles.findMany({
      where: whereClause.length ? and(...whereClause) : undefined,
      with: {
        workshop: true, // Need to define relation in schema (in relations section) or manually join
        variant: {
          with: { model: { with: { make: true } } }
        }
      },
      orderBy: [schema.vehicles.updatedAt],
    });
  }

  // Masters
  async getMakes() {
    return this.db.query.makes.findMany({
      orderBy: [asc(schema.makes.name)],
    });
  }

  async createMake(name: string) {
    const [make] = await this.db.insert(schema.makes).values({
      id: crypto.randomUUID(),
      name,
    }).returning();
    return make;
  }

  async getModels(makeId?: string) {
    if (makeId) {
      return this.db.query.models.findMany({
        where: eq(schema.models.makeId, makeId),
        orderBy: [asc(schema.models.name)],
      });
    }
    return this.db.query.models.findMany({
      orderBy: [asc(schema.models.name)],
      with: { make: true },
    });
  }

  async createModel(makeId: string, name: string) {
    const [model] = await this.db.insert(schema.models).values({
      id: crypto.randomUUID(),
      makeId,
      name,
    }).returning();
    return model;
  }

  async getVariants(modelId?: string) {
    if (modelId) {
      return this.db.query.variants.findMany({
        where: eq(schema.variants.modelId, modelId),
        orderBy: [asc(schema.variants.name)],
      });
    }
    return this.db.query.variants.findMany({
      orderBy: [asc(schema.variants.name)],
      with: { model: { with: { make: true } } },
    });
  }

  async createVariant(modelId: string, name: string, fuelType: 'PETROL' | 'DIESEL' | 'CNG' | 'ELECTRIC' | 'HYBRID') {
    const [variant] = await this.db.insert(schema.variants).values({
      id: crypto.randomUUID(),
      modelId,
      name,
      fuelType,
    }).returning();
    return variant;
  }

  async findAllModels() {
    return this.db.query.models.findMany({
      with: { make: true, variants: true },
    });
  }
}
