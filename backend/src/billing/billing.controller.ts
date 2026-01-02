import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { BillingService } from './billing.service';

@Controller('billing')
export class BillingController {
    constructor(private readonly billingService: BillingService) { }

    @Post('generate/:jobCardId')
    async generateInvoice(@Param('jobCardId') jobCardId: string) {
        return this.billingService.generateInvoice(jobCardId);
    }

    @Get('invoices/:id')
    async getInvoice(@Param('id') id: string) {
        return this.billingService.getInvoice(id);
    }
}
