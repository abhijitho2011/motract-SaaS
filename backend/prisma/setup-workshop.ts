import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function setupWorkshop() {
    console.log('Setting up workshop...');

    try {
        // Create workshop
        const workshop = await prisma.$executeRaw`
            INSERT INTO workshops (id, name, address, mobile, email, created_at, updated_at)
            VALUES (gen_random_uuid(), 'Demo Workshop', '123 Main Street', '9876543210', 'demo@workshop.com', NOW(), NOW())
            RETURNING id
        `;

        console.log('✅ Workshop created!');

        // Update user with workshop
        const hashedPassword = await bcrypt.hash('admin123', 10);

        await prisma.$executeRaw`
            UPDATE users 
            SET workshop_id = (SELECT id FROM workshops WHERE mobile = '9876543210')
            WHERE mobile = '9876543210'
        `;

        console.log('✅ User updated with workshop!');
        console.log('\n📱 Login: 9876543210 / admin123');
    } catch (error: any) {
        console.error('❌ Error:', error.message);
    }
}

setupWorkshop()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
