import { MapService } from './map.service';
import { RouteRequestDto } from './dto/route-request.dto';
export declare class MapController {
    private readonly mapService;
    constructor(mapService: MapService);
    getRoute(routeRequest: RouteRequestDto): Promise<any>;
}
