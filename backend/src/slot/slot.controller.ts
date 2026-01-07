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
    async deleteBay(@Request() req: any, @Param('id') id: string) {
        return this.slotService.deleteBay(id, req.user.workshopId);
    }

    // =============================================
    // Enhanced Slot Management (for client booking)
    // =============================================

    // Create manual slot
    @Post('create')
    async createManualSlot(
        @Request() req: any,
        @Body() data: { bayId: string; date: string; startTime: string; endTime: string }
    ) {
        try {
            return await this.slotService.createManualSlot({
                ...data,
                workshopId: req.user.workshopId,
            });
        } catch (e) {
            throw new Error(e.message);
            // In a real app, use HttpException filtering
        }
    }

    // Generate daily slots for all bays
    @Post('generate')
    async generateDailySlots(
        @Request() req: any,
        @Body() data: { date: string }
    ) {
        return this.slotService.generateDailySlots(req.user.workshopId, data.date);
    }

    // Get slot grid for a specific date
    @Get('grid')
    async getSlotGrid(
        @Request() req: any,
        @Query('date') date: string
    ) {
        return this.slotService.getSlotGrid(req.user.workshopId, date);
    }

    // Block or unblock a slot
    @Put(':slotId/status')
    async updateSlotStatus(
        @Request() req: any,
        @Param('slotId') slotId: string,
        @Body() data: { status: 'AVAILABLE' | 'BLOCKED' }
    ) {
        return this.slotService.updateSlotStatus(slotId, req.user.workshopId, data.status);
    }

    // Delete a specific slot
    @Delete(':slotId')
    async deleteSlot(
        @Request() req: any,
        @Param('slotId') slotId: string
    ) {
        return this.slotService.deleteSlot(slotId, req.user.workshopId);
    }

    // Get workshop bookings
    @Get('bookings')
    async getWorkshopBookings(@Request() req: any) {
        return this.slotService.getWorkshopBookings(req.user.workshopId);
    }

    // Update booking status
    @Put('bookings/:bookingId/status')
    async updateBookingStatus(
        @Request() req: any,
        @Param('bookingId') bookingId: string,
        @Body() data: { status: 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' }
    ) {
        return this.slotService.updateBookingStatus(bookingId, req.user.workshopId, data.status);
    }

    // =============================================
    // Workshop Holidays
    // =============================================

    // Block entire day (holiday)
    @Post('holidays')
    async blockEntireDay(
        @Request() req: any,
        @Body() data: { date: string; reason?: string }
    ) {
        return this.slotService.blockEntireDay(req.user.workshopId, data.date, data.reason);
    }

    // Unblock day
    @Delete('holidays/:date')
    async unblockDay(
        @Request() req: any,
        @Param('date') date: string
    ) {
        return this.slotService.unblockDay(req.user.workshopId, date);
    }

    // Get workshop holidays
    @Get('holidays')
    async getWorkshopHolidays(@Request() req: any) {
        return this.slotService.getWorkshopHolidays(req.user.workshopId);
    }

    // Get bay name templates (for dropdown)
    @Get('bay-templates')
    async getBayNameTemplates() {
        return this.slotService.getBayNameTemplates();
    }
}

