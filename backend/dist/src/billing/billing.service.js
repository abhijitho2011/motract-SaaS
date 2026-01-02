"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let BillingService = class BillingService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generateInvoice(jobCardId) {
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
        if (!job)
            throw new common_1.NotFoundException('Job Card not found');
        if (job.invoice)
            throw new common_1.BadRequestException('Invoice already generated for this Job Card');
        let totalLabor = 0;
        job.tasks.forEach((t) => {
            totalLabor += t.price;
        });
        let totalParts = 0;
        job.parts.forEach((p) => {
            totalParts += p.totalPrice;
        });
        let laborTax = 0;
        job.tasks.forEach(t => {
            laborTax += t.price * (t.gstPercent / 100);
        });
        let partsTax = 0;
        job.parts.forEach(p => {
            const basePrice = p.quantity * p.unitPrice;
            partsTax += (p.totalPrice - basePrice);
        });
        const totalTax = laborTax + partsTax;
        const cgst = totalTax / 2;
        const sgst = totalTax / 2;
        const grandTotal = totalLabor + laborTax + totalParts;
        let totalLaborBase = 0;
        job.tasks.forEach(t => totalLaborBase += t.price);
        let totalPartsBase = 0;
        job.parts.forEach(p => totalPartsBase += (p.quantity * p.unitPrice));
        const finalGrandTotal = totalLaborBase + laborTax + totalPartsBase + partsTax;
        const invoice = await this.prisma.invoice.create({
            data: {
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
            },
        });
        await this.prisma.jobCard.update({
            where: { id: jobCardId },
            data: { stage: 'BILLING' },
        });
        return invoice;
    }
    async getInvoice(id) {
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
};
exports.BillingService = BillingService;
exports.BillingService = BillingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BillingService);
//# sourceMappingURL=billing.service.js.map