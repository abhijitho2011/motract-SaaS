"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Seeding Master Data...');
    const categories = ['Spare Parts', 'Lubricants & Fluids', 'Tyres', 'Batteries', 'Accessories'];
    for (const cat of categories) {
        await prisma.category.create({ data: { name: cat } });
    }
    const vehicles = [
        {
            make: 'Maruti Suzuki',
            models: [
                { name: 'Swift', variants: ['LXi', 'VXi', 'ZXi'] },
                { name: 'Baleno', variants: ['Sigma', 'Delta', 'Zeta', 'Alpha'] },
            ],
        },
        {
            make: 'Hyundai',
            models: [
                { name: 'i20', variants: ['Magna', 'Sportz', 'Asta'] },
                { name: 'Creta', variants: ['E', 'EX', 'S', 'SX'] },
            ],
        },
        {
            make: 'Tata',
            models: [
                { name: 'Nexon', variants: ['XE', 'XM', 'XZ'] },
                { name: 'Harrier', variants: ['XM', 'XZ', 'XZ+'] },
            ],
        },
    ];
    for (const v of vehicles) {
        const make = await prisma.make.create({
            data: { name: v.make },
        });
        for (const m of v.models) {
            const model = await prisma.vehicleModel.create({
                data: {
                    name: m.name,
                    makeId: make.id,
                },
            });
            for (const variantName of m.variants) {
                await prisma.variant.create({
                    data: {
                        name: variantName,
                        fuelType: client_1.FuelType.PETROL,
                        modelId: model.id,
                    },
                });
            }
        }
    }
    console.log('Seeding completed.');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map