import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { WorkSchedulesService } from './work-schedules.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { OrganizationAdminGuard } from '../auth/guards/organaization-admin-gaurd';
import { CurrentUser } from '../auth/decorators';
import { ZodValidationPipe } from '../common';
import type { User } from '@repo/db';
import {
  createWorkScheduleRequestSchema,
  updateWorkScheduleRequestSchema,
  assignScheduleRequestSchema,
  unassignScheduleRequestSchema,
  type WorkScheduleListResponse,
  type WorkScheduleDetailResponse,
  type CreateWorkScheduleRequest,
  type UpdateWorkScheduleRequest,
  type AssignScheduleRequest,
  type UnassignScheduleRequest,
} from '@repo/contracts';

@Controller('organizations/:organizationId/work-schedules')
@UseGuards(AuthGuard, OrganizationAdminGuard)
export class WorkSchedulesController {
  constructor(private readonly workSchedulesService: WorkSchedulesService) {}

  @Get()
  async findAll(
    @Param('organizationId') organizationId: string,
  ): Promise<WorkScheduleListResponse> {
    return this.workSchedulesService.findAll(organizationId);
  }

  @Get(':id')
  async findOne(
    @Param('organizationId') organizationId: string,
    @Param('id') id: string,
  ): Promise<WorkScheduleDetailResponse> {
    return this.workSchedulesService.findOne(organizationId, id);
  }

  @Post()
  async create(
    @Param('organizationId') organizationId: string,
    @Body(new ZodValidationPipe(createWorkScheduleRequestSchema))
    data: CreateWorkScheduleRequest,
  ): Promise<WorkScheduleDetailResponse> {
    return this.workSchedulesService.create(organizationId, data);
  }

  @Patch(':id')
  async update(
    @Param('organizationId') organizationId: string,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateWorkScheduleRequestSchema))
    data: UpdateWorkScheduleRequest,
  ): Promise<WorkScheduleDetailResponse> {
    return this.workSchedulesService.update(organizationId, id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('organizationId') organizationId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.workSchedulesService.delete(organizationId, id);
  }

  @Post(':id/assign')
  async assignToUsers(
    @Param('organizationId') organizationId: string,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(assignScheduleRequestSchema))
    data: AssignScheduleRequest,
    @CurrentUser() user: User,
  ): Promise<{ assigned: number }> {
    return this.workSchedulesService.assignToUsers(
      organizationId,
      id,
      data,
      user.id,
    );
  }

  @Post(':id/unassign')
  async unassignFromUsers(
    @Param('organizationId') organizationId: string,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(unassignScheduleRequestSchema))
    data: UnassignScheduleRequest,
  ): Promise<{ unassigned: number }> {
    return this.workSchedulesService.unassignFromUsers(
      organizationId,
      id,
      data.userIds,
    );
  }
}
