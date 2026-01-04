import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { RsaService } from './rsa.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('rsa')
@UseGuards(JwtAuthGuard)
export class RsaController {
    constructor(private readonly rsaService: RsaService) { }

    // RSA Profile
    @Get('profile')
    async getProfile(@Req() req: any) {
        return this.rsaService.getOrCreateProfileByUserId(req.user.sub, req.user.rsaId);
    }

    // Go Online
    @Put('online')
    async goOnline(@Req() req: any, @Body() body: { lat: number; lng: number }) {
        try {
            console.log('goOnline controller - user:', JSON.stringify(req.user));
            console.log('goOnline controller - body:', JSON.stringify(body));
            const profile = await this.rsaService.getOrCreateProfileByUserId(req.user.sub, req.user.rsaId);
            console.log('goOnline controller - profile:', JSON.stringify(profile));
            if (!profile) {
                throw new BadRequestException('RSA profile not found and could not be created');
            }
            console.log('goOnline controller - calling goOnline with profile.id:', profile.id);
            return await this.rsaService.goOnline(profile.id, body.lat, body.lng);
        } catch (error: any) {
            console.error('goOnline controller error:', error);
            throw new BadRequestException(`goOnline failed: ${error.message || JSON.stringify(error)}`);
        }
    }

    // Go Offline
    @Put('offline')
    async goOffline(@Req() req: any) {
        const profile = await this.rsaService.getOrCreateProfileByUserId(req.user.sub, req.user.rsaId);
        if (!profile) {
            throw new Error('RSA profile not found');
        }
        return this.rsaService.goOffline(profile.id);
    }

    // Update Location
    @Put('location')
    async updateLocation(@Req() req: any, @Body() body: { lat: number; lng: number }) {
        const profile = await this.rsaService.getOrCreateProfileByUserId(req.user.sub, req.user.rsaId);
        if (!profile) {
            throw new Error('RSA profile not found');
        }
        return this.rsaService.updateLocation(profile.id, body.lat, body.lng);
    }

    // Get Pending Jobs (for RSA to see incoming requests)
    @Get('jobs/pending')
    async getPendingJobs() {
        return this.rsaService.getPendingJobs();
    }

    // Get My Jobs
    @Get('jobs')
    async getMyJobs(@Req() req: any, @Query('status') status?: string) {
        const profile = await this.rsaService.getOrCreateProfileByUserId(req.user.sub, req.user.rsaId);
        if (!profile) {
            throw new Error('RSA profile not found');
        }
        return this.rsaService.getJobsByRSA(profile.id, status);
    }

    // Get Job Details
    @Get('jobs/:id')
    async getJobDetails(@Param('id') id: string) {
        return this.rsaService.getJobById(id);
    }

    // Accept Job
    @Put('jobs/:id/accept')
    async acceptJob(@Param('id') id: string, @Req() req: any) {
        const profile = await this.rsaService.getOrCreateProfileByUserId(req.user.sub, req.user.rsaId);
        if (!profile) {
            throw new Error('RSA profile not found');
        }
        return this.rsaService.acceptJob(id, profile.id);
    }

    // Update Job Status
    @Put('jobs/:id/status')
    async updateJobStatus(
        @Param('id') id: string,
        @Req() req: any,
        @Body() body: { status: string }
    ) {
        const profile = await this.rsaService.getOrCreateProfileByUserId(req.user.sub, req.user.rsaId);
        if (!profile) {
            throw new Error('RSA profile not found');
        }
        return this.rsaService.updateJobStatus(id, profile.id, body.status);
    }

    // Complete Job
    @Put('jobs/:id/complete')
    async completeJob(
        @Param('id') id: string,
        @Req() req: any,
        @Body() body: { fare?: number; distanceKm?: number }
    ) {
        const profile = await this.rsaService.getOrCreateProfileByUserId(req.user.sub, req.user.rsaId);
        if (!profile) {
            throw new Error('RSA profile not found');
        }
        return this.rsaService.completeJob(id, profile.id, body.fare, body.distanceKm);
    }

    // Cancel Job
    @Put('jobs/:id/cancel')
    async cancelJob(
        @Param('id') id: string,
        @Req() req: any,
        @Body() body: { reason?: string }
    ) {
        return this.rsaService.cancelJob(id, req.user.sub, body.reason);
    }
}
