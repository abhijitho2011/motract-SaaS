import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DrizzleAsyncProvider } from '../drizzle/drizzle.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../drizzle/schema';
import { expenses } from '../drizzle/schema';
import { eq, desc, and } from 'drizzle-orm';
import * as crypto from 'crypto';

@Injectable()
export class ExpenseService {
  constructor(
    @Inject(DrizzleAsyncProvider)
    private db: NodePgDatabase<typeof schema>,
  ) { }

  async createExpense(data: typeof expenses.$inferInsert) {
    const [expense] = await this.db.insert(expenses).values({
      ...data,
      id: crypto.randomUUID(),
    }).returning();
    return expense;
  }

  async getExpenses(workshopId: string) {
    return this.db.query.expenses.findMany({
      where: eq(expenses.workshopId, workshopId),
      orderBy: [desc(expenses.date)],
    });
  }

  async deleteExpense(id: string, workshopId: string) {
    const [deleted] = await this.db
      .delete(expenses)
      .where(and(eq(expenses.id, id), eq(expenses.workshopId, workshopId)))
      .returning();

    if (!deleted) {
      throw new NotFoundException('Expense not found or access denied');
    }

    return deleted;
  }
}
