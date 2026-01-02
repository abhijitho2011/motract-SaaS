import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Query,
  Put,
} from '@nestjs/common';
import { JobCardService } from './job-card.service';
import { JobStage, JobPriority } from '@prisma/client';

@Controller('job-cards')
export class JobCardController {
  constructor(private readonly jobCardService: JobCardService) {}

  @Post()
  async create(
    @Body()
    body: {
      workshopId: string;
      vehicleId: string;
      customerName: string;
      customerMobile: string;
      advisorId?: string;
      odometer?: number;
      fuelLevel?: number;
      complaints?: string[];
      priority?: JobPriority;
    },
  ) {
    return this.jobCardService.create(body);
  }

  @Get()
  async findAll(@Query('workshopId') workshopId: string) {
    return this.jobCardService.findAll(workshopId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.jobCardService.findOne(id);
  }

  @Patch(':id/stage')
  async updateStage(@Param('id') id: string, @Body('stage') stage: JobStage) {
    return this.jobCardService.updateStage(id, stage);
  }

  @Put(':id/inspection')
  async saveInspection(
    @Param('id') id: string,
    @Body()
    body: {
      exterior: any;
      interior: any;
      tyres: any;
      battery?: string;
      documents?: any;
      photos: string[];
      fuelLevel?: number;
      odometer?: number;
    },
  ) {
    return this.jobCardService.saveInspection(id, body);
  }
  @Post(':id/tasks')
  async addTask(
    @Param('id') id: string,
    @Body()
    body: {
      description: string;
      price: number;
      gst: number;
    },
  ) {
    return this.jobCardService.addTask(id, body);
  }

  @Post(':id/parts')
  async addPart(
    @Param('id') id: string,
    @Body()
    body: {
      itemId: string;
      quantity: number;
      unitPrice: number;
      gst: number;
    },
  ) {
    return this.jobCardService.addPart(id, body);
  }

  @Patch(':id/technician')
  async assignTechnician(
    @Param('id') id: string,
    @Body() body: { technicianId: string },
  ) {
    return this.jobCardService.assignTechnician(id, body.technicianId);
  }

  @Patch(':id/tasks/:taskId/status')
  async updateTaskStatus(
    @Param('id') id: string,
    @Param('taskId') taskId: string,
    @Body() body: { status: string },
  ) {
    return this.jobCardService.updateTaskStatus(id, taskId, body.status);
  }
}
