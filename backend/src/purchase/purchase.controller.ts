import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('purchase')
@UseGuards(JwtAuthGuard)
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) { }

  // Suppliers
  @Post('suppliers')
  async createSupplier(@Request() req: any, @Body() data: any) {
    return this.purchaseService.createSupplier({
      ...data,
      workshopId: req.user.workshopId,
    });
  }

  @Get('suppliers')
  async getSuppliers(@Request() req: any) {
    return this.purchaseService.getSuppliers(req.user.workshopId);
  }

  @Get('suppliers/:id')
  async getSupplier(@Param('id') id: string) {
    return this.purchaseService.getSupplier(id);
  }

  @Get('suppliers/:id/ledger')
  async getSupplierLedger(@Param('id') id: string) {
    return this.purchaseService.getSupplierLedger(id);
  }

  // Purchase Orders
  @Post('orders')
  async createPurchaseOrder(@Request() req: any, @Body() data: any) {
    return this.purchaseService.createPurchaseOrder({
      ...data,
      workshopId: req.user.workshopId,
    });
  }

  @Get('orders')
  async getPurchaseOrders(@Request() req: any) {
    return this.purchaseService.getPurchaseOrders(req.user.workshopId);
  }

  @Get('orders/:id')
  async getPurchaseOrder(@Param('id') id: string) {
    return this.purchaseService.getPurchaseOrder(id);
  }

  @Patch('orders/:id/status')
  async updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.purchaseService.updatePurchaseOrderStatus(id, status);
  }
  @Post('orders/:id/receive')
  async receiveOrder(@Param('id') id: string) {
    return this.purchaseService.receivePurchaseOrder(id);
  }
}
