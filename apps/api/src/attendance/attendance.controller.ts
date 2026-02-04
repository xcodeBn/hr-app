import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { OrganizationAdminGuard } from '../auth/guards/organaization-admin-gaurd';
import { CurrentUser } from '../auth/decorators';
import { ZodValidationPipe } from '../common/pipes';
import type { User } from '@repo/db';
import {
  clockInRequestSchema,
  clockOutRequestSchema,
  type AttendanceListResponse,
  type AttendanceDetailResponse,
  type ClockInRequest,
  type ClockOutRequest,
  type AttendanceStatus,
} from '@repo/contracts';

@Controller('attendance')
@UseGuards(AuthGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  // Employee endpoints - clock in/out for themselves
  @Post('clock-in')
  async clockIn(
    @CurrentUser() user: User,
    @Body(new ZodValidationPipe(clockInRequestSchema)) data: ClockInRequest,
  ): Promise<AttendanceDetailResponse> {
    if (!user.organizationId) {
      throw new BadRequestException('User must belong to an organization');
    }
    return this.attendanceService.clockIn(user.id, user.organizationId, data);
  }

  @Post('clock-out')
  async clockOut(
    @CurrentUser() user: User,
    @Body(new ZodValidationPipe(clockOutRequestSchema)) data: ClockOutRequest,
  ): Promise<AttendanceDetailResponse> {
    return this.attendanceService.clockOut(user.id, data);
  }

  // Get own attendance history
  @Get('my')
  async getMyAttendance(
    @CurrentUser() user: User,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<AttendanceListResponse> {
    return this.attendanceService.findAll({
      organizationId: user.organizationId!,
      userId: user.id,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }
}

// Separate controller for admin operations
@Controller('organizations/:organizationId/attendance')
@UseGuards(AuthGuard, OrganizationAdminGuard)
export class AttendanceAdminController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get()
  async findAll(
    @Param('organizationId') organizationId: string,
    @Query('userId') userId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<AttendanceListResponse> {
    return this.attendanceService.findAll({
      organizationId,
      userId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<AttendanceDetailResponse> {
    return this.attendanceService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() data: { status?: AttendanceStatus; notes?: string | null },
  ): Promise<AttendanceDetailResponse> {
    return this.attendanceService.update(id, data);
  }

  @Patch(':id/approve')
  async approve(@Param('id') id: string): Promise<AttendanceDetailResponse> {
    return this.attendanceService.approve(id);
  }

  @Patch(':id/reject')
  async reject(@Param('id') id: string): Promise<AttendanceDetailResponse> {
    return this.attendanceService.reject(id);
  }
}
