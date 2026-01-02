import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { VehicleService } from './vehicle.service';

@Controller('vehicle')
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) { }

  @Get('lookup/:regNumber')
  async lookup(@Param('regNumber') regNumber: string) {
    return this.vehicleService.lookup(regNumber);
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
