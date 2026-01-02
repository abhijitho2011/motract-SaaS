import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('kpis')
  async getKPIs(@Query('workshopId') workshopId: string) {
    return this.dashboardService.getKPIs(workshopId);
  }

  @Get('job-funnel')
  async getJobStatusFunnel(@Query('workshopId') workshopId: string) {
    return this.dashboardService.getJobStatusFunnel(workshopId);
  }

  @Get('revenue-graph')
  async getRevenueGraph(
    @Query('workshopId') workshopId: string,
    @Query('days') days?: string,
  ) {
    const daysNum = days ? parseInt(days, 10) : 7;
    return this.dashboardService.getRevenueGraph(workshopId, daysNum);
  }

  @Get('top-services')
  async getTopServices(
    @Query('workshopId') workshopId: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 5;
    return this.dashboardService.getTopServices(workshopId, limitNum);
  }
}
