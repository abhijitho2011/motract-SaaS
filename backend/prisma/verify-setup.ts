import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifySetup() {
    console.log('Verifying workshop setup...\n');

    try {
        // Get user
        const user = await prisma.user.findUnique({
            where: { mobile: '9876543210' },
            include: { workshop: true }
        });

        if (!user) {
            console.log('❌ User not found');
            return;
        }

        console.log('✅ User found:');
        console.log('  ID:', user.id);
        console.log('  Name:', user.name);
        console.log('  Mobile:', user.mobile);
        console.log('  Role:', user.role);
        console.log('  Workshop ID:', user.workshopId);

        if (user.workshop) {
            console.log('\n✅ Workshop found:');
            console.log('  ID:', user.workshop.id);
            console.log('  Name:', user.workshop.name);
            console.log('  Address:', user.workshop.address);
            console.log('  Mobile:', user.workshop.mobile);
        } else {
            console.log('\n❌ No workshop associated with user');
        }

    } catch (error: any) {
        console.error('❌ Error:', error.message);
    }
}

verifySetup()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
