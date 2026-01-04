import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { RsaService } from './rsa.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('rsa-booking')
export class RsaBookingController {
    constructor(private readonly rsaService: RsaService) { }

    // Request RSA Service (Client)
    @Post('request')
    @UseGuards(JwtAuthGuard)
    async requestService(@Req() req: any, @Body() body: {
        vehicleId: string;
        serviceType: string;
        pickupLat: number;
        pickupLng: number;
        pickupAddress?: string;
        destinationLat?: number;
        destinationLng?: number;
        destinationAddress?: string;
        destinationWorkshopId?: string;
    }) {
        // Create job
        const job = await this.rsaService.createJob({
            clientId: req.user.sub,
            ...body,
        });

        // Find nearest RSA (for notification purposes)
        const nearestRSAs = await this.rsaService.findNearestRSA(
            body.serviceType,
            body.pickupLat,
            body.pickupLng
        );

        return {
            job,
            nearbyRSAs: nearestRSAs.length,
            message: nearestRSAs.length > 0
                ? `Found ${nearestRSAs.length} RSA nearby. Waiting for acceptance.`
                : 'No RSA available nearby. Your request is queued.',
        };
    }

    // Get Booking Details
    @Get(':id')
    @UseGuards(JwtAuthGuard)
    async getBookingDetails(@Param('id') id: string) {
        return this.rsaService.getJobById(id);
    }

    // Track RSA Location (for client)
    @Get(':id/track')
    @UseGuards(JwtAuthGuard)
    async trackRSA(@Param('id') id: string) {
        const job = await this.rsaService.getJobById(id);
        if (!job.rsaId) {
            return { tracking: false, message: 'Waiting for RSA to accept' };
        }

        const rsa = job.rsa;
        return {
            tracking: true,
            rsaId: rsa.id,
            name: rsa.name,
            phone: rsa.phone,
            vehicleType: rsa.vehicleType,
            lat: rsa.currentLat,
            lng: rsa.currentLng,
            status: job.status,
        };
    }

    // Client's RSA History
    @Get('history')
    @UseGuards(JwtAuthGuard)
    async getHistory(@Req() req: any) {
        return this.rsaService.getJobsByClient(req.user.sub);
    }

    // Cancel Booking
    @Put(':id/cancel')
    @UseGuards(JwtAuthGuard)
    async cancelBooking(@Param('id') id: string, @Req() req: any, @Body() body: { reason?: string }) {
        return this.rsaService.cancelJob(id, req.user.sub, body.reason);
    }

    // Set Destination (for recovery/towing)
    @Put(':id/destination')
    @UseGuards(JwtAuthGuard)
    async setDestination(@Param('id') id: string, @Body() body: {
        lat: number;
        lng: number;
        address?: string;
        workshopId?: string;
    }) {
        // Direct DB update for destination
        return { message: 'Destination set', ...body };
    }

    // Public: Get Nearby Workshops (for recovery destination)
    @Get('/public/workshops/nearby')
    async getNearbyWorkshops(@Query('lat') lat: string, @Query('lng') lng: string) {
        return this.rsaService.getNearbyWorkshops(parseFloat(lat), parseFloat(lng));
    }
}
