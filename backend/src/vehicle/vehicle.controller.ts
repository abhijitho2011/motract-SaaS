import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { VehicleService } from './vehicle.service';

@Controller('vehicle')
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) { }

  @Get('lookup/:regNumber')
  async lookup(@Param('regNumber') regNumber: string) {
    return this.vehicleService.lookup(regNumber);
  }

  @Post('masters/makes')
  async createMake(@Body() body: { name: string }) {
    return this.vehicleService.createMake(body.name);
  }

  @Post('masters/models')
  async createModel(@Body() body: { makeId: string; name: string }) {
    return this.vehicleService.createModel(body.makeId, body.name);
  }

  @Post('masters/variants')
  async createVariant(@Body() body: { modelId: string; name: string; fuelType: any }) {
    return this.vehicleService.createVariant(body.modelId, body.name, body.fuelType);
  }

  @Post('register')
  async register(@Body() data: any) {
    return this.vehicleService.register(data);
  }

  @Get('masters/models')
  async getModels() {
    return this.vehicleService.findAllModels();
  }
}
