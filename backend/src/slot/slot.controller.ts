import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { SlotService } from './slot.service';
import { Prisma, BayType } from '@prisma/client';

@Controller('slots')
export class SlotController {
  constructor(private readonly slotService: SlotService) {}

  @Post('bays')
  async createBay(
    @Body() data: { workshopId: string; name: string; type: BayType },
  ) {
    return this.slotService.createBay(data);
  }

  @Get('bays')
  async findBays(@Query('workshopId') workshopId: string) {
    return this.slotService.findBays(workshopId);
  }

  @Post('book')
  async bookSlot(@Body() data: Prisma.SlotBookingCreateInput) {
    return this.slotService.bookSlot(data);
  }
}
