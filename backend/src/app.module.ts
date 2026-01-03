import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DrizzleModule } from './drizzle/drizzle.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { VehicleModule } from './vehicle/vehicle.module';
import { JobCardModule } from './job-card/job-card.module';
import { InventoryModule } from './inventory/inventory.module';
import { BillingModule } from './billing/billing.module';
import { SlotModule } from './slot/slot.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { PurchaseModule } from './purchase/purchase.module';
import { ExpenseModule } from './expense/expense.module';
import { ReportsModule } from './reports/reports.module';
import { SuperAdminModule } from './super-admin/super-admin.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { MapModule } from './map/map.module';


import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Security: Rate limiting
    ThrottlerModule.forRoot([{
      ttl: Number(process.env.THROTTLE_TTL) || 60000,
      limit: Number(process.env.THROTTLE_LIMIT) || 10,
    }]),
    DrizzleModule,
    UsersModule,
    AuthModule,
    VehicleModule,
    JobCardModule,
    InventoryModule,
    BillingModule,
    SlotModule,
    DashboardModule,
    PurchaseModule,
    ExpenseModule,
    ReportsModule,
    SuperAdminModule,
    MapModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
