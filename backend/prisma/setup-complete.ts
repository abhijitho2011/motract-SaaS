import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createWorkshopAndUser() {
    console.log('Creating workshop and updating user...');

    try {
        // First, check if user exists
        let user = await prisma.user.findUnique({
            where: { mobile: '9876543210' }
        });

        // Create workshop
        const workshop = await prisma.workshop.create({
            data: {
                name: 'Demo Workshop',
                address: '123 Main Street, City',
                mobile: '9876543210',
                email: 'demo@workshop.com',
            }
        });

        console.log('✅ Workshop created:', workshop.id);

        // If user doesn't exist, create it
        if (!user) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            user = await prisma.user.create({
                data: {
                    mobile: '9876543210',
                    password: hashedPassword,
                    name: 'Workshop Admin',
                    role: 'WORKSHOP_ADMIN',
                    workshopId: workshop.id,
                }
            });
            console.log('✅ User created');
        } else {
            // Update existing user with workshop
            await prisma.user.update({
                where: { id: user.id },
                data: { workshopId: workshop.id }
            });
            console.log('✅ User updated with workshop');
        }

        console.log('\n📱 Login: 9876543210 / admin123');
        console.log('🏢 Workshop:', workshop.name);
        console.log('🆔 Workshop ID:', workshop.id);

    } catch (error: any) {
        console.error('❌ Error:', error.message);
        if (error.code) {
            console.error('Error code:', error.code);
        }
    }
}

createWorkshopAndUser()
    .catch((e) => {
        console.error('Fatal error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
