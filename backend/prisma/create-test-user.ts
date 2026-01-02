import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createTestUser() {
    console.log('Creating test user...');

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash('admin123', 10);

        // Create admin user (workshopId is optional)
        const user = await prisma.user.create({
            data: {
                mobile: '9876543210',
                password: hashedPassword,
                name: 'Workshop Admin',
                role: 'WORKSHOP_ADMIN',
            },
        });

        console.log('✅ User created successfully!');
        console.log('');
        console.log('📱 Login credentials:');
        console.log('   Mobile: 9876543210');
        console.log('   Password: admin123');
        console.log('');
    } catch (error: any) {
        if (error.code === 'P2002') {
            console.log('⚠️  User already exists with mobile: 9876543210');
            console.log('');
            console.log('📱 Use these credentials:');
            console.log('   Mobile: 9876543210');
            console.log('   Password: admin123');
        } else {
            throw error;
        }
    }
}

createTestUser()
    .catch((e) => {
        console.error('❌ Error:', e.message);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
