import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ClientService } from './client.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../auth/public.decorator';

@Controller('client')
export class ClientController {
    constructor(private readonly clientService: ClientService) { }

    // =============================================
    // Public Endpoints (No Auth Required)
    // =============================================

    @Public()
    @Post('register')
    async register(@Body() body: {
        name: string;
        email: string;
        mobile: string;
        password: string;
    }) {
        return this.clientService.registerClient(body);
    }

    // =============================================
    // Protected Endpoints (Auth Required)
    // =============================================

    // --- Vehicle Management ---

    @UseGuards(JwtAuthGuard)
    @Get('vehicles')
    async getMyVehicles(@Req() req: any) {
        return this.clientService.getClientVehicles(req.user.userId);
    }

    @UseGuards(JwtAuthGuard)
    @Post('vehicles/add')
    async addVehicle(@Req() req: any, @Body() body: { regNumber: string }) {
        return this.clientService.addVehicleToClient(req.user.userId, body.regNumber);
    }

    @UseGuards(JwtAuthGuard)
    @Post('vehicles/verify')
    async verifyAndAddVehicle(@Req() req: any, @Body() body: { vehicleId: string; vinNumber: string }) {
        return this.clientService.verifyVinAndLinkVehicle(req.user.userId, body.vehicleId, body.vinNumber);
    }

    // --- Service History ---

    @UseGuards(JwtAuthGuard)
    @Get('vehicles/:id/history')
    async getVehicleHistory(@Req() req: any, @Param('id') vehicleId: string) {
        return this.clientService.getVehicleServiceHistory(req.user.userId, vehicleId);
    }

    // --- Workshop Booking ---

    @UseGuards(JwtAuthGuard)
    @Get('booking/categories')
    async getBookingCategories() {
        return this.clientService.getWorkshopCategories();
    }

    @UseGuards(JwtAuthGuard)
    @Get('booking/workshops')
    async searchWorkshops(
        @Query('categoryId') categoryId?: string,
        @Query('query') query?: string,
        @Query('lat') lat?: string,
        @Query('lng') lng?: string
    ) {
        return this.clientService.searchWorkshops(
            categoryId,
            query,
            lat ? parseFloat(lat) : undefined,
            lng ? parseFloat(lng) : undefined
        );
    }

    @UseGuards(JwtAuthGuard)
    @Get('booking/workshops/:id/slots')
    async getWorkshopSlots(
        @Param('id') workshopId: string,
        @Query('date') date: string
    ) {
        return this.clientService.getWorkshopSlots(workshopId, date);
    }

    @UseGuards(JwtAuthGuard)
    @Post('booking/create')
    async createBooking(@Req() req: any, @Body() body: {
        workshopId: string;
        vehicleId: string;
        serviceCategories: string[];
        bookingDate: string;
        slotTime: string;
        notes?: string;
    }) {
        return this.clientService.createWorkshopBooking(req.user.userId, body);
    }

    @UseGuards(JwtAuthGuard)
    @Get('booking/my-bookings')
    async getMyBookings(@Req() req: any) {
        return this.clientService.getClientBookings(req.user.userId);
    }
}
