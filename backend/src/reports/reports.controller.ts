import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('sales')
  async getSales(
    @Request() req: any,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.reportsService.getSalesReport(
      req.user.workshopId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('gst')
  async getGST(
    @Request() req: any,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    return this.reportsService.getGSTReport(
      req.user.workshopId,
      parseInt(month),
      parseInt(year),
    );
  }

  @Get('pnl')
  async getPnL(
    @Request() req: any,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.reportsService.getProfitLoss(
      req.user.workshopId,
      new Date(startDate),
      new Date(endDate),
    );
  }
}
