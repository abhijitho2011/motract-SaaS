import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BillingService {
    constructor(private prisma: PrismaService) { }

    async generateInvoice(jobCardId: string) {
        const job = await this.prisma.jobCard.findUnique({
            where: { id: jobCardId },
            include: {
                tasks: true,
                parts: true,
                customer: true,
                vehicle: true,
                workshop: true,
                invoice: true,
            },
        });

        if (!job) throw new NotFoundException('Job Card not found');
        if (job.invoice) throw new BadRequestException('Invoice already generated for this Job Card');

        // Calculate Totals
        let totalLabor = 0;
        job.tasks.forEach((t) => {
            // Basic logic: if not approved, maybe skip? For now assume all valid tasks are billable
            // or only 'DONE' tasks. Let's bill all for simplicity in Phase 1
            totalLabor += t.price;
        });

        let totalParts = 0;
        job.parts.forEach((p) => {
            totalParts += p.totalPrice;
        });

        // Tax Logic (Simplified: 9% CGST + 9% SGST on total)
        // In a real app, gstPercent is per item.
        // Let's iterate and sum up tax amounts accurately if we wanted, 
        // but for this MVP, we will rely on the totals we have.
        // Wait, the `JobTask` and `JobPart` have `gstPercent`. 
        // Let's calculate correctly.

        // Actually `totalPrice` in JobPart already includes tax? 
        // Let's check JobCardService.addPart: 
        // totalPrice: data.quantity * data.unitPrice * (1 + data.gst / 100) -> YES it includes tax.

        // For Tasks: price (Labor cost). gstPercent default 18.
        // So labor tax needs to be added.
        let laborTax = 0;
        job.tasks.forEach(t => {
            laborTax += t.price * (t.gstPercent / 100);
        });

        // For Parts: totalPrice includes tax. 
        // We need to back-calculate basic and tax if we want to show breakdown, 
        // OR just take the tax component difference.
        // part.totalPrice = qty * unit * (1+gst)
        // tax = part.totalPrice - (qty * unit)
        let partsTax = 0;
        job.parts.forEach(p => {
            const basePrice = p.quantity * p.unitPrice;
            partsTax += (p.totalPrice - basePrice);
        });

        const totalTax = laborTax + partsTax;
        const cgst = totalTax / 2;
        const sgst = totalTax / 2;

        const grandTotal = totalLabor + laborTax + totalParts;
        // Wait, totalParts already includes tax. totalLabor does NOT (it's base price).
        // So GrandTotal = TotalLaborBase + LaborTax + TotalParts(inclusive).

        // Let's refine the schema usage.
        // Invoice.totalLabor -> usually untaxed or taxed? 
        // Let's store base amounts in totalLabor/totalParts and taxes separately for clarity?
        // The Schema says: totalLabor, totalParts, cgst, sgst, grandTotal.
        // Usually these are base amounts.

        // Recalculating for precision:
        let totalLaborBase = 0;
        job.tasks.forEach(t => totalLaborBase += t.price);

        let totalPartsBase = 0;
        job.parts.forEach(p => totalPartsBase += (p.quantity * p.unitPrice));

        // Re-sum taxes
        // We already calculated laborTax and partsTax above.

        const finalGrandTotal = totalLaborBase + laborTax + totalPartsBase + partsTax;

        // Create Invoice
        const invoice = await this.prisma.invoice.create({
            data: {
                workshopId: job.workshopId,
                customerId: job.customerId,
                jobCardId: job.id,
                invoiceNumber: `INV-${Date.now()}`, // Simple ID
                type: 'JOB_CARD',
                totalLabor: totalLaborBase,
                totalParts: totalPartsBase,
                cgst: cgst,
                sgst: sgst,
                igst: 0,
                grandTotal: finalGrandTotal,
                balance: finalGrandTotal, // Unpaid initially
            },
        });

        // Update Job Stage
        await this.prisma.jobCard.update({
            where: { id: jobCardId },
            data: { stage: 'BILLING' },
        });

        return invoice;
    }

    async getInvoice(id: string) {
        return this.prisma.invoice.findUnique({
            where: { id },
            include: {
                customer: true,
                jobCard: {
                    include: {
                        vehicle: true,
                        tasks: true,
                        parts: { include: { item: true } }
                    }
                },
                workshop: true
            }
        });
    }
}
