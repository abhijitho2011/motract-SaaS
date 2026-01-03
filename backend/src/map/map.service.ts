import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { DrizzleAsyncProvider } from '../drizzle/drizzle.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../drizzle/schema';
import { mapSettings } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import { RouteRequestDto } from './dto/route-request.dto';

@Injectable()
export class MapService {
    constructor(
        @Inject(DrizzleAsyncProvider)
        private db: NodePgDatabase<typeof schema>,
    ) { }

    async getRoute(routeRequest: RouteRequestDto) {
        // Get active Bhuvan API token
        const settings = await this.db.query.mapSettings.findFirst({
            where: eq(mapSettings.isActive, true),
        });

        if (!settings || !settings.apiToken) {
            throw new BadRequestException('Map API token not configured');
        }

        // Check if token is expired
        if (settings.expiresAt) {
            const expiryDate = new Date(settings.expiresAt);
            if (expiryDate < new Date()) {
                throw new BadRequestException('Map API token has expired. Please update in Settings.');
            }
        }

        // Call Bhuvan API
        const url = `https://bhuvan-app1.nrsc.gov.in/api/routing/curl_routing_state.php?lat1=${routeRequest.lat1}&lon1=${routeRequest.lon1}&lat2=${routeRequest.lat2}&lon2=${routeRequest.lon2}&token=${settings.apiToken}`;

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });

            if (!response.ok) {
                throw new BadRequestException(`Bhuvan API error: ${response.statusText}`);
            }

            const data = await response.json();

            // Return null if no data available
            if (!data || data === null || (Array.isArray(data) && data.length === 0)) {
                return null;
            }

            return data;
        } catch (error) {
            console.error('Bhuvan API error:', error);
            throw new BadRequestException('Failed to fetch route from Bhuvan API');
        }
    }

    async testConnection(token: string) {
        // Test with a sample route (Delhi coordinates)
        const testUrl = `https://bhuvan-app1.nrsc.gov.in/api/routing/curl_routing_state.php?lat1=28.6139&lon1=77.2090&lat2=28.7041&lon2=77.1025&token=${token}`;

        try {
            const response = await fetch(testUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });

            return {
                success: response.ok,
                status: response.status,
                message: response.ok ? 'Connection successful' : 'Connection failed',
            };
        } catch (error) {
            return {
                success: false,
                status: 500,
                message: 'Failed to connect to Bhuvan API',
            };
        }
    }
}
