import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestData() {
    console.log('Creating comprehensive test data...\n');

    try {
        // Get workshop
        const workshop = await prisma.workshop.findFirst({
            where: { mobile: '9876543210' }
        });

        if (!workshop) {
            console.log('❌ Workshop not found');
            return;
        }

        console.log('✅ Workshop found:', workshop.id);

        // 1. Create Bays
        console.log('\n📍 Creating bays...');
        const bay1 = await prisma.bay.create({
            data: {
                name: 'Bay 1 - General Service',
                type: 'GENERAL',
                workshopId: workshop.id,
            }
        });
        const bay2 = await prisma.bay.create({
            data: {
                name: 'Bay 2 - Painting',
                type: 'PAINTING',
                workshopId: workshop.id,
            }
        });
        console.log('  ✅ Created 2 bays');

        // 2. Create Customers
        console.log('\n👥 Creating customers...');
        const customer1 = await prisma.customer.create({
            data: {
                workshopId: workshop.id,
                name: 'Rajesh Kumar',
                mobile: '9876543211',
                email: 'rajesh@example.com',
            }
        });
        const customer2 = await prisma.customer.create({
            data: {
                workshopId: workshop.id,
                name: 'Priya Sharma',
                mobile: '9876543212',
                email: 'priya@example.com',
            }
        });
        console.log('  ✅ Created 2 customers');

        // 3. Create Vehicles
        console.log('\n🚗 Creating vehicles...');
        const variant = await prisma.variant.findFirst();

        if (!variant) {
            console.log('  ⚠️  No variants found, skipping vehicle creation');
        } else {
            const vehicle1 = await prisma.vehicle.create({
                data: {
                    registrationNumber: 'DL01AB1234',
                    variantId: variant.id,
                    year: 2023,
                    color: 'White',
                }
            });
            const vehicle2 = await prisma.vehicle.create({
                data: {
                    registrationNumber: 'DL02CD5678',
                    variantId: variant.id,
                    year: 2022,
                    color: 'Black',
                }
            });
            console.log('  ✅ Created 2 vehicles');

            // 4. Create Job Cards
            console.log('\n📋 Creating job cards...');
            const jobCard1 = await prisma.jobCard.create({
                data: {
                    workshopId: workshop.id,
                    vehicleId: vehicle1.id,
                    customerId: customer1.id,
                    stage: 'CREATED',
                    priority: 'NORMAL',
                    odometer: 15000,
                    fuelLevel: 50,
                    complaints: {
                        create: [
                            { complaint: 'Engine making noise' },
                            { complaint: 'AC not cooling' }
                        ]
                    }
                }
            });
            const jobCard2 = await prisma.jobCard.create({
                data: {
                    workshopId: workshop.id,
                    vehicleId: vehicle2.id,
                    customerId: customer2.id,
                    stage: 'INSPECTION',
                    priority: 'URGENT',
                    odometer: 25000,
                    fuelLevel: 75,
                    complaints: {
                        create: [
                            { complaint: 'Brake pads worn out' }
                        ]
                    }
                }
            });
            console.log('  ✅ Created 2 job cards');
        }

        // 5. Create Inventory Items
        console.log('\n📦 Creating inventory items...');
        const category = await prisma.category.findFirst();

        if (!category) {
            console.log('  ⚠️  No categories found, skipping inventory');
        } else {
            await prisma.inventoryItem.create({
                data: {
                    workshopId: workshop.id,
                    name: 'Engine Oil 5W-30',
                    categoryId: category.id,
                    stockQuantity: 50,
                    minStockLevel: 10,
                    unitPrice: 450,
                    unit: 'Liter',
                }
            });
            await prisma.inventoryItem.create({
                data: {
                    workshopId: workshop.id,
                    name: 'Brake Pads - Front',
                    categoryId: category.id,
                    stockQuantity: 20,
                    minStockLevel: 5,
                    unitPrice: 1200,
                    unit: 'Set',
                }
            });
            console.log('  ✅ Created 2 inventory items');
        }

        console.log('\n✅ Test data creation complete!');
        console.log('\nSummary:');
        console.log('  - Bays: 2');
        console.log('  - Customers: 2');
        console.log('  - Vehicles: 2');
        console.log('  - Job Cards: 2');
        console.log('  - Inventory Items: 2');

    } catch (error: any) {
        console.error('❌ Error:', error.message);
        if (error.meta) {
            console.error('Details:', error.meta);
        }
    }
}

createTestData()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
