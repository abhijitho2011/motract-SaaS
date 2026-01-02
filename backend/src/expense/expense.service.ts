import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ExpenseService {
    constructor(private prisma: PrismaService) { }

    async createExpense(data: Prisma.ExpenseCreateInput) {
        return this.prisma.expense.create({ data });
    }

    async getExpenses(workshopId: string) {
        return this.prisma.expense.findMany({
            where: { workshopId },
            orderBy: { date: 'desc' },
        });
    }

    async deleteExpense(id: string) {
        return this.prisma.expense.delete({ where: { id } });
    }
}
