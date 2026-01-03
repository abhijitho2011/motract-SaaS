import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { SuperAdminService } from './super-admin.service';

@Controller('super-admin')
export class SuperAdminController {
    constructor(private readonly superAdminService: SuperAdminService) { }

    // Dashboard
    @Get('dashboard/stats')
    async getDashboardStats() {
        return this.superAdminService.getDashboardStats();
    }

    // Account Management
    @Post('accounts')
    async createOrganization(@Body() data: any) {
        return this.superAdminService.createOrganization(data);
    }

    @Get('accounts')
    async getAllOrganizations(
        @Query('accountType') accountType?: string,
        @Query('isAuthorized') isAuthorized?: string,
        @Query('isActive') isActive?: string,
    ) {
        const filters: any = {};
        if (accountType) filters.accountType = accountType;
        if (isAuthorized !== undefined) filters.isAuthorized = isAuthorized === 'true';
        if (isActive !== undefined) filters.isActive = isActive === 'true';

        return this.superAdminService.getAllOrganizations(filters);
    }

    @Get('accounts/:id')
    async getOrganization(@Param('id') id: string) {
        return this.superAdminService.getOrganizationById(id);
    }

    @Put('accounts/:id')
    async updateOrganization(@Param('id') id: string, @Body() data: any) {
        return this.superAdminService.updateOrganization(id, data);
    }

    @Delete('accounts/:id')
    async deleteOrganization(@Param('id') id: string) {
        return this.superAdminService.deleteOrganization(id);
    }

    // Monitoring
    @Get('authorized-accounts')
    async getAuthorizedAccounts() {
        return this.superAdminService.getAuthorizedOrganizations();
    }

    @Get('rsa-activity')
    async getRSAActivity() {
        return this.superAdminService.getRSAOrganizations();
    }

    // Online Bookings
    @Get('online-bookings')
    async getOnlineBookings(
        @Query('organizationId') organizationId?: string,
        @Query('status') status?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        const filters: any = {};
        if (organizationId) filters.organizationId = organizationId;
        if (status) filters.status = status;
        if (startDate) filters.startDate = startDate;
        if (endDate) filters.endDate = endDate;

        return this.superAdminService.getAllBookings(filters);
    }
}
