import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('expenses')
@UseGuards(JwtAuthGuard)
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) { }

  @Post()
  async create(@Request() req: any, @Body() data: any) {
    return this.expenseService.createExpense({
      ...data,
      workshopId: req.user.workshopId,
    });
  }

  @Get()
  async findAll(@Request() req: any) {
    return this.expenseService.getExpenses(req.user.workshopId);
  }

  @Delete(':id')
  async remove(@Request() req: any, @Param('id') id: string) {
    return this.expenseService.deleteExpense(id, req.user.workshopId);
  }
}
