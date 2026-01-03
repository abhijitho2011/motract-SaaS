import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) { }

  @Get('kpis')
  async getKPIs(@Request() req: any, @Query('workshopId') queryWorkshopId?: string) {
    if (req.user.role === 'SUPER_ADMIN' && queryWorkshopId) {
      return this.dashboardService.getKPIs(queryWorkshopId);
    }
    return this.dashboardService.getKPIs(req.user.workshopId);
  }

  @Get('job-funnel')
  async getJobStatusFunnel(@Request() req: any, @Query('workshopId') queryWorkshopId?: string) {
    if (req.user.role === 'SUPER_ADMIN' && queryWorkshopId) {
      return this.dashboardService.getJobStatusFunnel(queryWorkshopId);
    }
    return this.dashboardService.getJobStatusFunnel(req.user.workshopId);
  }

  @Get('revenue-graph')
  async getRevenueGraph(
    @Request() req: any,
    @Query('workshopId') queryWorkshopId?: string,
    @Query('days') days?: string,
  ) {
    const daysNum = days ? parseInt(days, 10) : 7;
    if (req.user.role === 'SUPER_ADMIN' && queryWorkshopId) {
      return this.dashboardService.getRevenueGraph(queryWorkshopId, daysNum);
    }
    return this.dashboardService.getRevenueGraph(req.user.workshopId, daysNum);
  }

  @Get('top-services')
  async getTopServices(
    @Request() req: any,
    @Query('workshopId') queryWorkshopId?: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 5;
    if (req.user.role === 'SUPER_ADMIN' && queryWorkshopId) {
      return this.dashboardService.getTopServices(queryWorkshopId, limitNum);
    }
    return this.dashboardService.getTopServices(req.user.workshopId, limitNum);
  }
}
