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
import { MasterDataModule } from './master-data/master-data.module';
import { ReportModule } from './report/report.module';

@Module({
  imports: [
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
    MasterDataModule,
    ReportModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
