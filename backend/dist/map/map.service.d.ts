import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../drizzle/schema';
import { RouteRequestDto } from './dto/route-request.dto';
export declare class MapService {
    private db;
    constructor(db: NodePgDatabase<typeof schema>);
    getRoute(routeRequest: RouteRequestDto): Promise<any>;
    testConnection(token: string): Promise<{
        success: boolean;
        status: number;
        message: string;
    }>;
}
