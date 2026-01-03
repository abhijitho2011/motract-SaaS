import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { SlotService } from './slot.service';

@Controller('slots')
export class SlotController {
    constructor(private readonly slotService: SlotService) { }

    @Post('bays')
    async createBay(
        @Body() data: { workshopId: string; name: string; type: 'SERVICE' | 'WASHING' | 'ALIGNMENT' | 'ELECTRICAL' | 'GENERAL' },
    ) {
        return this.slotService.createBay(data as any);
    }

    @Get('bays')
    async findBays(@Query('workshopId') workshopId: string) {
        return this.slotService.findBays(workshopId);
    }

    @Post('book')
    async bookSlot(@Body() data: any) {
        return this.slotService.bookSlot(data);
    }
}
