import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { DrizzleAsyncProvider } from '../drizzle/drizzle.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../drizzle/schema';
import { invoices, jobCards } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import * as crypto from 'crypto';

@Injectable()
export class BillingService {
  constructor(
    @Inject(DrizzleAsyncProvider)
    private db: NodePgDatabase<typeof schema>,
  ) { }

  async generateInvoice(jobCardId: string) {
    let job = await this.db.query.jobCards.findFirst({
      where: eq(jobCards.id, jobCardId),
      with: {
        jobItems: true, // tasks
        jobParts: true, // parts
        customer: true,
        vehicle: true,
        workshop: true,
        invoices: true, // check if invoice exists (named invoices plural in relations)
      }
    });

    if (!job) {
      // Try finding by Job Card Number (readable ID)
      job = await this.db.query.jobCards.findFirst({
        where: eq(jobCards.jobCardNumber, jobCardId), // logic assumes jobCardId input could be Number string
        with: {
          jobItems: true,
          jobParts: true,
          customer: true,
          vehicle: true,
          workshop: true,
          invoices: true,
        }
      });
    }

    if (!job) throw new NotFoundException('Job Card not found');

    // Check if any invoice exists for this job card
    if (job.invoices && job.invoices.length > 0)
      throw new BadRequestException(
        'Invoice already generated for this Job Card',
      );

    // Calculate Totals
    let totalLabor = 0;
    job.jobItems.forEach((t) => {
      // Basic logic: if not approved, maybe skip? For now bill all
      totalLabor += t.price;
    });

    let totalParts = 0;
    job.jobParts.forEach((p) => {
      totalParts += p.totalPrice; // includes tax already logic from JobCardService
    });

    // Tax Logic
    let laborTax = 0;
    job.jobItems.forEach((t) => {
      laborTax += t.price * (t.gstPercent / 100);
    });

    // parts tax included in totalPrice.
    // part.totalPrice = qty * unit * (1+gst)
    let partsTax = 0;
    job.jobParts.forEach((p) => {
      const basePrice = p.quantity * p.unitPrice;
      partsTax += p.totalPrice - basePrice;
    });

    const totalTax = laborTax + partsTax;
    const cgst = totalTax / 2;
    const sgst = totalTax / 2;

    // Recalculating for precision:
    let totalLaborBase = 0;
    job.jobItems.forEach((t) => (totalLaborBase += t.price)); // price is base

    let totalPartsBase = 0;
    job.jobParts.forEach((p) => (totalPartsBase += p.quantity * p.unitPrice)); // base

    const finalGrandTotal =
      totalLaborBase + laborTax + totalPartsBase + partsTax; // Match logic

    // Create Invoice
    const [invoice] = await this.db.insert(invoices).values({
      id: crypto.randomUUID(),
      workshopId: job.workshopId,
      customerId: job.customerId,
      jobCardId: job.id,
      invoiceNumber: `INV-${Date.now()}`,
      type: 'JOB_CARD',
      totalLabor: totalLaborBase,
      totalParts: totalPartsBase,
      cgst: cgst,
      sgst: sgst,
      igst: 0,
      grandTotal: finalGrandTotal,
      balance: finalGrandTotal,
    }).returning();

    // Update Job Stage
    await this.db.update(jobCards)
      .set({ stage: 'BILLING' })
      .where(eq(jobCards.id, jobCardId));

    return invoice;
  }

  async getInvoice(id: string) {
    const invoice = await this.db.query.invoices.findFirst({
      where: eq(invoices.id, id),
      with: {
        customer: true,
        jobCard: {
          with: {
            vehicle: true,
            jobItems: true, // tasks
            jobParts: { with: { inventoryItem: true } }, // parts with item
          }
        },
        workshop: true,
      }
    });

    // Remap relations if needed to match frontend
    if (!invoice) return null;

    // Flatten structure if needed? 
    // Frontend likely uses .jobCard.tasks etc.
    const res: any = { ...invoice };
    if (res.jobCard) {
      res.jobCard.tasks = res.jobCard.jobItems;
      res.jobCard.parts = res.jobCard.jobParts.map((p: any) => ({
        ...p,
        item: p.inventoryItem
      }));
    }

    return res;
  }
}
