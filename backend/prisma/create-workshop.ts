import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createWorkshop() {
    console.log('Creating workshop for test user...');

    try {
        // Find the test user
        const user = await prisma.user.findUnique({
            where: { mobile: '9876543210' },
        });

        if (!user) {
            console.log('❌ Test user not found');
            return;
        }

        // Create workshop
        const workshop = await prisma.workshop.create({
            data: {
                name: 'Demo Workshop',
                address: '123 Main Street, City',
                mobile: '9876543210',
                email: 'workshop@example.com',
                gstNumber: 'GST123456789',
            },
        });

        // Update user with workshop
        await prisma.user.update({
            where: { id: user.id },
            data: { workshopId: workshop.id },
        });

        console.log('✅ Workshop created successfully!');
        console.log('Workshop ID:', workshop.id);
        console.log('Workshop Name:', workshop.name);
    } catch (error: any) {
        console.error('❌ Error:', error.message);
    }
}

createWorkshop()
    .catch((e) => {
        console.error('Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
