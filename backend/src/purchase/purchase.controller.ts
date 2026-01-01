import { Controller, Get, Post, Body, Param, Patch, Query } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { Prisma } from '@prisma/client';

@Controller('purchase')
export class PurchaseController {
    constructor(private readonly purchaseService: PurchaseService) { }

    // Suppliers
    @Post('suppliers')
    async createSupplier(@Body() data: Prisma.SupplierCreateInput) {
        return this.purchaseService.createSupplier(data);
    }

    @Get('suppliers')
    async getSuppliers(@Query('workshopId') workshopId: string) {
        return this.purchaseService.getSuppliers(workshopId);
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
    async createPurchaseOrder(@Body() data: any) {
        return this.purchaseService.createPurchaseOrder(data);
    }

    @Get('orders')
    async getPurchaseOrders(@Query('workshopId') workshopId: string) {
        return this.purchaseService.getPurchaseOrders(workshopId);
    }

    @Get('orders/:id')
    async getPurchaseOrder(@Param('id') id: string) {
        return this.purchaseService.getPurchaseOrder(id);
    }

    @Patch('orders/:id/status')
    async updateStatus(@Param('id') id: string, @Body('status') status: string) {
        return this.purchaseService.updatePurchaseOrderStatus(id, status);
    }
}
