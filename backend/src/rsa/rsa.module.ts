import { Module } from '@nestjs/common';
import { RsaController } from './rsa.controller';
import { RsaService } from './rsa.service';
import { RsaBookingController } from './rsa-booking.controller';
import { RsaGateway } from './rsa.gateway';
import { DrizzleModule } from '../drizzle/drizzle.module';

@Module({
    imports: [DrizzleModule],
    controllers: [RsaController, RsaBookingController],
    providers: [RsaService, RsaGateway],
    exports: [RsaService, RsaGateway],
})
export class RsaModule { }
