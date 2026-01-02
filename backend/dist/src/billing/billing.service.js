"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_provider_1 = require("../drizzle/drizzle.provider");
const node_postgres_1 = require("drizzle-orm/node-postgres");
const schema_1 = require("../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
const crypto = __importStar(require("crypto"));
let BillingService = class BillingService {
    db;
    constructor(db) {
        this.db = db;
    }
    async generateInvoice(jobCardId) {
        const job = await this.db.query.jobCards.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.jobCards.id, jobCardId),
            with: {
                jobItems: true,
                jobParts: true,
                customer: true,
                vehicle: true,
                workshop: true,
                invoices: true,
            }
        });
        if (!job)
            throw new common_1.NotFoundException('Job Card not found');
        if (job.invoices && job.invoices.length > 0)
            throw new common_1.BadRequestException('Invoice already generated for this Job Card');
        let totalLabor = 0;
        job.jobItems.forEach((t) => {
            totalLabor += t.price;
        });
        let totalParts = 0;
        job.jobParts.forEach((p) => {
            totalParts += p.totalPrice;
        });
        let laborTax = 0;
        job.jobItems.forEach((t) => {
            laborTax += t.price * (t.gstPercent / 100);
        });
        let partsTax = 0;
        job.jobParts.forEach((p) => {
            const basePrice = p.quantity * p.unitPrice;
            partsTax += p.totalPrice - basePrice;
        });
        const totalTax = laborTax + partsTax;
        const cgst = totalTax / 2;
        const sgst = totalTax / 2;
        let totalLaborBase = 0;
        job.jobItems.forEach((t) => (totalLaborBase += t.price));
        let totalPartsBase = 0;
        job.jobParts.forEach((p) => (totalPartsBase += p.quantity * p.unitPrice));
        const finalGrandTotal = totalLaborBase + laborTax + totalPartsBase + partsTax;
        const [invoice] = await this.db.insert(schema_1.invoices).values({
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
        await this.db.update(schema_1.jobCards)
            .set({ stage: 'BILLING' })
            .where((0, drizzle_orm_1.eq)(schema_1.jobCards.id, jobCardId));
        return invoice;
    }
    async getInvoice(id) {
        const invoice = await this.db.query.invoices.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.invoices.id, id),
            with: {
                customer: true,
                jobCard: {
                    with: {
                        vehicle: true,
                        jobItems: true,
                        jobParts: { with: { inventoryItem: true } },
                    }
                },
                workshop: true,
            }
        });
        if (!invoice)
            return null;
        const res = { ...invoice };
        if (res.jobCard) {
            res.jobCard.tasks = res.jobCard.jobItems;
            res.jobCard.parts = res.jobCard.jobParts.map((p) => ({
                ...p,
                item: p.inventoryItem
            }));
        }
        return res;
    }
};
exports.BillingService = BillingService;
exports.BillingService = BillingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(drizzle_provider_1.DrizzleAsyncProvider)),
    __metadata("design:paramtypes", [node_postgres_1.NodePgDatabase])
], BillingService);
//# sourceMappingURL=billing.service.js.map