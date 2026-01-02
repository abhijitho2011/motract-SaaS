import { Injectable, Inject } from '@nestjs/common';
import { DrizzleAsyncProvider } from '../drizzle/drizzle.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import { users } from '../drizzle/schema';

@Injectable()
export class UsersService {
  constructor(
    @Inject(DrizzleAsyncProvider)
    private db: NodePgDatabase<typeof schema>,
  ) { }

  async create(data: typeof users.$inferInsert) {
    const result = await this.db.insert(users).values(data).returning();
    return result[0];
  }

  async findOne(mobile: string) {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.mobile, mobile));
    return result[0] || null;
  }
}
