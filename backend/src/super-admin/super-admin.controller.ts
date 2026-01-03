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
    @Post('organizations')
    async createOrganization(@Body() data: any) {
        return this.superAdminService.createOrganization(data);
    }

    @Get('organizations')
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

    @Get('organizations/map')
    async getMapData(@Query('accountType') accountType?: string) {
        const filters: any = {};
        if (accountType) filters.accountType = accountType;
        return this.superAdminService.getMapData(filters);
    }

    @Get('organizations/:id')
    async getOrganization(@Param('id') id: string) {
        return this.superAdminService.getOrganizationById(id);
    }

    @Put('organizations/:id')
    async updateOrganization(@Param('id') id: string, @Body() data: any) {
        return this.superAdminService.updateOrganization(id, data);
    }

    @Delete('organizations/:id')
    async deleteOrganization(@Param('id') id: string) {
        return this.superAdminService.deleteOrganization(id);
    }

    // Category Management
    @Get('categories')
    async getAllCategories() {
        return this.superAdminService.getAllCategories();
    }

    @Post('categories')
    async createCategory(@Body() data: any) {
        return this.superAdminService.createCategory(data);
    }

    @Put('categories/:id')
    async updateCategory(@Param('id') id: string, @Body() data: any) {
        return this.superAdminService.updateCategory(id, data);
    }

    @Delete('categories/:id')
    async deleteCategory(@Param('id') id: string) {
        return this.superAdminService.deleteCategory(id);
    }

    @Get('categories/:id/sub-categories')
    async getSubCategories(@Param('id') categoryId: string) {
        return this.superAdminService.getSubCategories(categoryId);
    }

    @Post('categories/:id/sub-categories')
    async createSubCategory(@Param('id') categoryId: string, @Body() data: any) {
        return this.superAdminService.createSubCategory(categoryId, data);
    }

    // Monitoring
    @Get('authorized-organizations')
    async getAuthorizedOrganizations() {
        return this.superAdminService.getAuthorizedOrganizations();
    }

    @Get('rsa-organizations')
    async getRSAOrganizations() {
        return this.superAdminService.getRSAOrganizations();
    }

    // Online Bookings
    @Get('bookings')
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
    // SECURITY: Reset endpoint removed - use direct database access for data cleanup
    // @Delete('reset-database')
    // async resetDatabase(@Query('key') key: string) {
    //     if (key !== 'RESET_ME_NOW') {
    //         throw new Error('Invalid key');
    //     }
    //     return this.superAdminService.resetDatabase();
    // }
}
