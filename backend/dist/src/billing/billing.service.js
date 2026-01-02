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
const client_1 = require("@prisma/client");
let BillingService = class BillingService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createJobCardInvoice(jobCardId) {
        const jobCard = await this.prisma.jobCard.findUnique({
            where: { id: jobCardId },
            include: { tasks: true, parts: { include: { item: true } }, customer: true },
        });
        if (!jobCard)
            throw new common_1.NotFoundException('Job Card not found');
        let laborTotal = 0;
        if (jobCard.tasks) {
            jobCard.tasks.forEach(task => laborTotal += task.price);
        }
        let partsTotal = 0;
        if (jobCard.parts) {
            jobCard.parts.forEach(part => partsTotal += (part.price * part.quantity));
        }
        const totalAmount = laborTotal + partsTotal;
        const sgst = totalAmount * 0.09;
        const cgst = totalAmount * 0.09;
        const finalAmount = totalAmount + sgst + cgst;
        const invoice = await this.prisma.invoice.create({
            data: {
                invoiceType: client_1.InvoiceType.JOB_CARD,
                jobCardId,
                customerId: jobCard.customerId,
                workshopId: jobCard.workshopId,
                totalAmount: finalAmount,
                sgst,
                cgst,
                igst: 0,
                paidAmount: 0,
                balanceAmount: finalAmount,
                status: 'PENDING',
            },
        });
        return invoice;
    }
};
exports.BillingService = BillingService;
exports.BillingService = BillingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BillingService);
//# sourceMappingURL=billing.service.js.map