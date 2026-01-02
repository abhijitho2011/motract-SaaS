import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../src/drizzle/schema'; // Adjust path if needed
import { workshops, users } from '../src/drizzle/schema';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';

async function main() {
    console.log('Connecting to database...');
    // Ensure DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL is not set');
    }

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(pool, { schema });

    const workshopId = 'test-workshop';
    const mobile = '9876543210';

    console.log(`Checking for workshop: ${workshopId}`);
    try {
        const existingWorkshop = await db.query.workshops.findFirst({
            where: eq(workshops.id, workshopId)
        });

        if (!existingWorkshop) {
            console.log('Creating workshop...');
            await db.insert(workshops).values({
                id: workshopId,
                name: 'Motract Dev Workshop',
                address: '123 Dev St',
                mobile: '1234567890',
                isActive: true,
                updatedAt: new Date().toISOString(),
                workingDays: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
            });
            console.log('Workshop created.');
        } else {
            console.log('Workshop already exists.');
        }

        console.log(`Checking for user: ${mobile}`);
        const existingUser = await db.query.users.findFirst({
            where: eq(users.mobile, mobile)
        });

        if (!existingUser) {
            console.log('Creating user...');
            const hashedPassword = await bcrypt.hash('password123', 10);
            await db.insert(users).values({
                id: crypto.randomUUID(),
                mobile: mobile,
                password: hashedPassword, // Note: Schema has password field
                role: 'WORKSHOP_ADMIN',
                name: 'Test Admin',
                workshopId: workshopId,
                updatedAt: new Date().toISOString(),
            });
            console.log('User created.');
        } else {
            console.log('User already exists.');
            // Ensure linked to workshop
            if (existingUser.workshopId !== workshopId) {
                console.log('Updating user workshop link...');
                await db.update(users)
                    .set({ workshopId: workshopId })
                    .where(eq(users.mobile, mobile));
            }
        }

    } catch (e) {
        console.error('Error during setup:', e);
    } finally {
        await pool.end();
    }
}

main();
