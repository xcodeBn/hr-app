import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { EmploymentsService } from './employments.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ZodValidationPipe } from '../common/pipes';
import {
  createEmploymentRequestSchema,
  updateEmploymentRequestSchema,
  type EmploymentListResponse,
  type EmploymentDetailResponse,
  type CreateEmploymentRequest,
  type UpdateEmploymentRequest,
} from '@repo/contracts';
import { OrganizationAdminGuard } from '../auth/guards/organaization-admin-gaurd';

@Controller('organizations/:organizationId/employments')
@UseGuards(AuthGuard, OrganizationAdminGuard)
export class EmploymentsController {
  constructor(private readonly employmentsService: EmploymentsService) {}

  @Get()
  async findAll(
    @Param('organizationId') organizationId: string,
  ): Promise<EmploymentListResponse> {
    return this.employmentsService.findAll(organizationId);
  }

  @Get('user/:userId')
  async findByUser(
    @Param('userId') userId: string,
  ): Promise<EmploymentListResponse> {
    return this.employmentsService.findByUser(userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<EmploymentDetailResponse> {
    return this.employmentsService.findOne(id);
  }

  @Post()
  async create(
    @Body(new ZodValidationPipe(createEmploymentRequestSchema))
    data: CreateEmploymentRequest,
  ): Promise<EmploymentDetailResponse> {
    return this.employmentsService.create(data);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateEmploymentRequestSchema))
    data: UpdateEmploymentRequest,
  ): Promise<EmploymentDetailResponse> {
    return this.employmentsService.update(id, data);
  }

  @Patch(':id/terminate')
  async terminate(
    @Param('id') id: string,
    @Body('endDate') endDate: string,
  ): Promise<EmploymentDetailResponse> {
    return this.employmentsService.terminate(id, new Date(endDate));
  }
}
