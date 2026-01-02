import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { Prisma } from '@prisma/client';

@Controller('expenses')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Post()
  async create(@Body() data: Prisma.ExpenseCreateInput) {
    return this.expenseService.createExpense(data);
  }

  @Get()
  async findAll(@Query('workshopId') workshopId: string) {
    return this.expenseService.getExpenses(workshopId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.expenseService.deleteExpense(id);
  }
}
