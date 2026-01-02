import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDashboardData() {
    console.log('Checking dashboard data...\n');

    try {
        const workshopId = '162b12df-4d9c-4e4c-98e8-969071af2d8b'; // Assuming this is the workshop ID

        // 1. Check Job Cards
        const jobCards = await prisma.jobCard.findMany({
            where: { workshopId },
            orderBy: { createdAt: 'desc' },
            take: 5
        });

        console.log(`Found ${jobCards.length} recent job cards:`);
        jobCards.forEach(jc => {
            console.log(`- ID: ${jc.id}`);
            console.log(`  Stage: ${jc.stage}`);
            console.log(`  Entry Time: ${jc.entryTime}`);
            console.log(`  Created At: ${jc.createdAt}`);
        });

        // 2. Check "Today" logic
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        console.log(`\nToday (Server Time): ${today.toISOString()}`);

        // 3. Count manually
        const vehiclesIn = await prisma.jobCard.count({
            where: {
                workshopId,
                entryTime: { gte: today },
            },
        });
        console.log(`\nManual Count "Vehicles In" (>= Today): ${vehiclesIn}`);

    } catch (error: any) {
        console.error('❌ Error:', error.message);
    }
}

checkDashboardData()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
