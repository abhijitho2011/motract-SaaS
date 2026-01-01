import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { VehicleModule } from './vehicle/vehicle.module';
import { JobCardModule } from './job-card/job-card.module';
import { InventoryModule } from './inventory/inventory.module';
import { BillingModule } from './billing/billing.module';
import { SlotModule } from './slot/slot.module';

@Module({
  imports: [PrismaModule, UsersModule, AuthModule, VehicleModule, JobCardModule, InventoryModule, BillingModule, SlotModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
