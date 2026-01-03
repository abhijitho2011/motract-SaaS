import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { InspectionService } from './inspection.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('inspections/masters')
export class InspectionController {
    constructor(private readonly inspectionService: InspectionService) { }

    @Post()
    async create(@Request() req, @Body() body: { category: string; name: string }) {
        return this.inspectionService.create({
            workshopId: req.user.workshopId,
            category: body.category,
            name: body.name,
        });
    }

    @Get()
    async findAll(@Request() req) {
        return this.inspectionService.findAll(req.user.workshopId);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.inspectionService.delete(id);
    }
}
