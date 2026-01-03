import { Controller, Post, Body, Get, Query, Put, Delete, Param } from '@nestjs/common';
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

    @Put('bays/:id')
    async updateBay(@Param('id') id: string, @Body() data: any) {
        return this.slotService.updateBay(id, data);
    }

    @Delete('bays/:id')
    async deleteBay(@Param('id') id: string) {
        return this.slotService.deleteBay(id);
    }
}
