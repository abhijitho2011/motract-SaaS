"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_provider_1 = require("../drizzle/drizzle.provider");
const node_postgres_1 = require("drizzle-orm/node-postgres");
const schema_1 = require("../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
let MapService = class MapService {
    db;
    constructor(db) {
        this.db = db;
    }
    async getRoute(routeRequest) {
        const settings = await this.db.query.mapSettings.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.mapSettings.isActive, true),
        });
        if (!settings || !settings.apiToken) {
            throw new common_1.BadRequestException('Map API token not configured');
        }
        if (settings.expiresAt) {
            const expiryDate = new Date(settings.expiresAt);
            if (expiryDate < new Date()) {
                throw new common_1.BadRequestException('Map API token has expired. Please update in Settings.');
            }
        }
        const url = `https://bhuvan-app1.nrsc.gov.in/api/routing/curl_routing_state.php?lat1=${routeRequest.lat1}&lon1=${routeRequest.lon1}&lat2=${routeRequest.lat2}&lon2=${routeRequest.lon2}&token=${settings.apiToken}`;
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            if (!response.ok) {
                throw new common_1.BadRequestException(`Bhuvan API error: ${response.statusText}`);
            }
            const data = await response.json();
            if (!data || data === null || (Array.isArray(data) && data.length === 0)) {
                return null;
            }
            return data;
        }
        catch (error) {
            console.error('Bhuvan API error:', error);
            throw new common_1.BadRequestException('Failed to fetch route from Bhuvan API');
        }
    }
    async testConnection(token) {
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
        }
        catch (error) {
            return {
                success: false,
                status: 500,
                message: 'Failed to connect to Bhuvan API',
            };
        }
    }
};
exports.MapService = MapService;
exports.MapService = MapService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(drizzle_provider_1.DrizzleAsyncProvider)),
    __metadata("design:paramtypes", [node_postgres_1.NodePgDatabase])
], MapService);
//# sourceMappingURL=map.service.js.map