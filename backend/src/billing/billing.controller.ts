import { Controller, Post, Body, Param } from '@nestjs/common';
import { BillingService } from './billing.service';

@Controller('billing')
export class BillingController {
    constructor(private readonly billingService: BillingService) { }

    @Post('invoice/job-card/:id')
    async createJobCardInvoice(@Param('id') jobCardId: string) {
        return this.billingService.createJobCardInvoice(jobCardId);
    }
}
