import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { users, organizations } from '../drizzle/schema';
import { DrizzleAsyncProvider } from '../drizzle/drizzle.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @Inject(DrizzleAsyncProvider)
    private db: NodePgDatabase<typeof schema>,
  ) { }

  async validateUser(mobile: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(mobile);
    if (user && user.password && (await bcrypt.compare(pass, user.password))) {

      // Check if attached organization exists (Zombie user check)
      if (user.role !== 'SUPER_ADMIN') {
        if (!user.workshopId) {
          return null; // Orphaned user
        }

        const org = await this.db.query.organizations.findFirst({
          where: eq(organizations.id, user.workshopId),
        });

        if (!org) {
          // Organization deleted, block login
          return null;
        }

        // STRICT ACCESS CONTROL: Only WORKSHOP accounts can login to Workshop App
        // RSA, Supplier, Rebuild Center are blocked until their apps are ready
        if (org.accountType !== 'WORKSHOP') {
          return null;
        }
      }

      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = {
      mobile: user.mobile,
      sub: user.id,
      role: user.role,
      workshopId: user.workshopId,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  async register(data: typeof users.$inferInsert) {
    if (!data.id) {
      // Use randomBytes for Node compatibility
      data.id = crypto.randomBytes(16).toString('hex');
    }

    // Hash password
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    return this.usersService.create(data);
  }
}
