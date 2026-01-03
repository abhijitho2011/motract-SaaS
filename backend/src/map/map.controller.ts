import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { MapService } from './map.service';
import { RouteRequestDto } from './dto/route-request.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('map')
@UseGuards(JwtAuthGuard)
export class MapController {
    constructor(private readonly mapService: MapService) { }

    @Get('route')
    async getRoute(@Query() routeRequest: RouteRequestDto) {
        return this.mapService.getRoute(routeRequest);
    }
}
