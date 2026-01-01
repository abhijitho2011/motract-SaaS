import { Module } from '@nestjs/common';
import { JobCardService } from './job-card.service';
import { JobCardController } from './job-card.controller';

@Module({
  providers: [JobCardService],
  controllers: [JobCardController]
})
export class JobCardModule {}
