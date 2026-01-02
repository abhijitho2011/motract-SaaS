import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestVehicle() {
    console.log('Creating test vehicle...');

    try {
        // Get workshop
        const workshop = await prisma.workshop.findFirst({
            where: { mobile: '9876543210' }
        });

        if (!workshop) {
            console.log('❌ Workshop not found');
            return;
        }

        // Get or create a make
        let make = await prisma.make.findFirst();
        if (!make) {
            make = await prisma.make.create({
                data: { name: 'Maruti Suzuki' }
            });
        }

        // Get or create a model
        let model = await prisma.vehicleModel.findFirst({
            where: { makeId: make.id }
        });
        if (!model) {
            model = await prisma.vehicleModel.create({
                data: {
                    name: 'Swift',
                    makeId: make.id
                }
            });
        }

        // Get or create a variant
        let variant = await prisma.variant.findFirst({
            where: { modelId: model.id }
        });
        if (!variant) {
            variant = await prisma.variant.create({
                data: {
                    name: 'VXi',
                    fuelType: 'PETROL',
                    modelId: model.id
                }
            });
        }

        // Create a test vehicle
        const vehicle = await prisma.vehicle.create({
            data: {
                registrationNumber: 'DL01AB1234',
                variantId: variant.id,
                year: 2023,
                color: 'White'
            }
        });

        console.log('✅ Test vehicle created!');
        console.log('  Registration:', vehicle.registrationNumber);
        console.log('  ID:', vehicle.id);
        console.log('  Make:', make.name);
        console.log('  Model:', model.name);
        console.log('  Variant:', variant.name);

    } catch (error: any) {
        console.error('❌ Error:', error.message);
    }
}

createTestVehicle()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
