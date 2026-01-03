import { Controller, Post, Body, Get, Query, Put, Delete, Param, UseGuards, Request } from '@nestjs/common';
import { SlotService } from './slot.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('slots')
@UseGuards(JwtAuthGuard)
export class SlotController {
    constructor(private readonly slotService: SlotService) { }

    @Post('bays')
    async createBay(
        @Request() req: any,
        @Body() data: { name: string; type: 'SERVICE' | 'WASHING' | 'ALIGNMENT' | 'ELECTRICAL' | 'GENERAL' },
    ) {
        return this.slotService.createBay({
            ...data,
            workshopId: req.user.workshopId,
        } as any);
    }

    @Get('bays')
    async findBays(@Request() req: any) {
        return this.slotService.findBays(req.user.workshopId);
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
