import { Module } from '@nestjs/common';
import { MapController } from './map.controller';
import { MapService } from './map.service';
import { DrizzleModule } from '../drizzle/drizzle.module';

@Module({
    imports: [DrizzleModule],
    controllers: [MapController],
    providers: [MapService],
    exports: [MapService],
})
export class MapModule { }
