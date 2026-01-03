import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('billing')
@UseGuards(JwtAuthGuard)
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
