import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkData() {
    console.log('Checking database state...\n');

    try {
        // Check workshops
        const workshops = await prisma.workshop.findMany();
        console.log('Workshops:', workshops.length);
        workshops.forEach(w => {
            console.log(`  - ${w.name} (ID: ${w.id})`);
        });

        // Check users
        const users = await prisma.user.findMany({
            include: { workshop: true }
        });
        console.log('\nUsers:', users.length);
        users.forEach(u => {
            console.log(`  - ${u.name} (${u.mobile}) - Workshop: ${u.workshop?.name || 'NONE'}`);
        });

        // Check vehicles
        const vehicles = await prisma.vehicle.count();
        console.log('\nVehicles:', vehicles);

        // Check makes/models
        const makes = await prisma.make.count();
        const models = await prisma.vehicleModel.count();
        console.log('Makes:', makes);
        console.log('Models:', models);

        // Check bays
        const bays = await prisma.bay.findMany();
        console.log('\nBays:', bays.length);
        bays.forEach(b => {
            console.log(`  - ${b.name} (Workshop: ${b.workshopId})`);
        });

    } catch (error: any) {
        console.error('❌ Error:', error.message);
    }
}

checkData()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
