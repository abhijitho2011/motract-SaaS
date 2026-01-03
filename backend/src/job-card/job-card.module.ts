import { Module } from '@nestjs/common';
import { JobCardService } from './job-card.service';
import { JobCardController } from './job-card.controller';
import { InspectionService } from './inspection.service';
import { InspectionController } from './inspection.controller';

@Module({
  providers: [JobCardService, InspectionService],
  controllers: [JobCardController, InspectionController],
})
export class JobCardModule { }
