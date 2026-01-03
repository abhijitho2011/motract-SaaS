import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { InventoryService } from './inventory.service';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) { }

  @Get('masters/brands')
  async getBrands() {
    return this.inventoryService.getBrands();
  }

  @Post('masters/brands')
  async createBrand(@Body() body: { name: string }) {
    return this.inventoryService.createBrand(body.name);
  }

  @Get('masters/categories')
  async getCategories() {
    return this.inventoryService.getCategories();
  }

  @Post('masters/categories')
  async createCategory(@Body() body: { name: string }) {
    return this.inventoryService.createCategory(body.name);
  }

  @Get('masters/sub-categories')
  async getSubCategories(@Query('categoryId') categoryId?: string) {
    return this.inventoryService.getSubCategories(categoryId);
  }

  @Post('masters/sub-categories')
  async createSubCategory(@Body() body: { categoryId: string; name: string }) {
    return this.inventoryService.createSubCategory(body.categoryId, body.name);
  }

  @Post('items')
  async createItem(@Body() data: any) {
    return this.inventoryService.createItem(data);
  }

  @Post('items/:id/skus')
  async addSku(@Param('id') id: string, @Body('skuCode') skuCode: string) {
    return this.inventoryService.addSku(id, skuCode);
  }

  @Post('items/:id/batches')
  async addBatch(@Param('id') id: string, @Body() body: any) {
    // Body validation needed in real app
    return this.inventoryService.addBatch(id, body);
  }

  @Get('items')
  async findAll(@Query('workshopId') workshopId: string) {
    return this.inventoryService.findAll(workshopId);
  }

  @Get('items/:id')
  async findOne(@Param('id') id: string) {
    return this.inventoryService.findOne(id);
  }

  @Post('items/:id/compatibility')
  async addCompatibility(
    @Param('id') id: string,
    @Body('modelId') modelId: string,
    @Body('variantId') variantId?: string,
  ) {
    return this.inventoryService.addCompatibility(id, modelId, variantId);
  }

  @Get('items/:id/compatibility')
  async getCompatibility(@Param('id') id: string) {
    return this.inventoryService.getCompatibility(id);
  }
  @Post('items/:id/adjust')
  async adjustStock(
    @Param('id') id: string,
    @Body('quantity') quantity: number,
    @Body('reason') reason: string,
  ) {
    return this.inventoryService.adjustStock(id, quantity, reason);
  }
}
