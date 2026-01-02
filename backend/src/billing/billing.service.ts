import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, JobStage, InvoiceType, PaymentMode } from '@prisma/client';

@Injectable()
export class BillingService {
    constructor(private prisma: PrismaService) { }

    async createJobCardInvoice(jobCardId: string) {
        const jobCard = await this.prisma.jobCard.findUnique({
            where: { id: jobCardId },
            include: { tasks: true, parts: { include: { item: true } }, customer: true },
        });

        if (!jobCard) throw new NotFoundException('Job Card not found');

        // Calculate totals
        let laborTotal = 0;
        if (jobCard.tasks) {
            (jobCard.tasks as any[]).forEach(task => laborTotal += task.price);
        }

        let partsTotal = 0;
        if (jobCard.parts) {
            (jobCard.parts as any[]).forEach(part => partsTotal += part.totalPrice);
        }

        const totalAmount = laborTotal + partsTotal;
        // Simplified tax calculation for Phase 1 (Assuming inclusive or flat add)
        const sgst = totalAmount * 0.09; // 9%
        const cgst = totalAmount * 0.09; // 9%
        const finalAmount = totalAmount + sgst + cgst;

        const invoice = await this.prisma.invoice.create({
            data: {
                type: InvoiceType.JOB_CARD,
                invoiceNumber: `INV-${Date.now()}`, // TODO: Generate sequential invoice number
                jobCardId,
                customerId: jobCard.customerId,
                workshopId: jobCard.workshopId,
                totalLabor: laborTotal,
                totalParts: partsTotal,
                cgst,
                sgst,
                igst: 0,
                grandTotal: finalAmount,
                paidAmount: 0,
                balance: finalAmount,
            },
        });

        return invoice;
    }
}
