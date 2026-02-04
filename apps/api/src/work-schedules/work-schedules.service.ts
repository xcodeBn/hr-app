import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import type {
  WorkScheduleListResponse,
  WorkScheduleDetailResponse,
  CreateWorkScheduleRequest,
  UpdateWorkScheduleRequest,
  AssignScheduleRequest,
} from '@repo/contracts';

@Injectable()
export class WorkSchedulesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all work schedules for an organization
   */
  async findAll(organizationId: string): Promise<WorkScheduleListResponse> {
    const schedules = await this.prisma.workSchedule.findMany({
      where: { organizationId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
      include: {
        _count: {
          select: { dailySchedules: true, assignedUsers: true },
        },
      },
    });

    return {
      schedules: schedules as unknown as WorkScheduleListResponse['schedules'],
      total: schedules.length,
    };
  }

  /**
   * Get a single work schedule by ID
   */
  async findOne(
    organizationId: string,
    id: string,
  ): Promise<WorkScheduleDetailResponse> {
    const schedule = await this.prisma.workSchedule.findFirst({
      where: { id, organizationId },
      include: {
        dailySchedules: {
          orderBy: { dayOfWeek: 'asc' },
        },
        _count: {
          select: { assignedUsers: true },
        },
      },
    });

    if (!schedule) {
      throw new NotFoundException(`Work schedule with ID ${id} not found`);
    }

    return schedule as unknown as WorkScheduleDetailResponse;
  }

  /**
   * Create a new work schedule
   */
  async create(
    organizationId: string,
    data: CreateWorkScheduleRequest,
  ): Promise<WorkScheduleDetailResponse> {
    const { dailySchedules, ...scheduleData } = data;

    // Check for duplicate name
    const existing = await this.prisma.workSchedule.findUnique({
      where: { organizationId_name: { organizationId, name: data.name } },
    });

    if (existing) {
      throw new ConflictException(
        `Work schedule "${data.name}" already exists`,
      );
    }

    // If setting as default, unset other defaults
    if (data.isDefault) {
      await this.prisma.workSchedule.updateMany({
        where: { organizationId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const schedule = await this.prisma.workSchedule.create({
      data: {
        ...scheduleData,
        organizationId,
        dailySchedules: {
          create: dailySchedules.map((day) => ({
            dayOfWeek: day.dayOfWeek,
            hoursPerDay: day.hoursPerDay,
            startTime: day.startTime,
            endTime: day.endTime,
            isWorkingDay: day.isWorkingDay,
          })),
        },
      },
      include: {
        dailySchedules: {
          orderBy: { dayOfWeek: 'asc' },
        },
        _count: {
          select: { assignedUsers: true },
        },
      },
    });

    return schedule as unknown as WorkScheduleDetailResponse;
  }

  /**
   * Update a work schedule
   */
  async update(
    organizationId: string,
    id: string,
    data: UpdateWorkScheduleRequest,
  ): Promise<WorkScheduleDetailResponse> {
    const existing = await this.prisma.workSchedule.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      throw new NotFoundException(`Work schedule with ID ${id} not found`);
    }

    const { dailySchedules, ...scheduleData } = data;

    // Check for duplicate name
    if (data.name && data.name !== existing.name) {
      const duplicate = await this.prisma.workSchedule.findUnique({
        where: { organizationId_name: { organizationId, name: data.name } },
      });
      if (duplicate) {
        throw new ConflictException(
          `Work schedule "${data.name}" already exists`,
        );
      }
    }

    // If setting as default, unset other defaults
    if (data.isDefault && !existing.isDefault) {
      await this.prisma.workSchedule.updateMany({
        where: { organizationId, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    // Update schedule and daily schedules in transaction
    const schedule = await this.prisma.$transaction(async (tx) => {
      // Update daily schedules if provided
      if (dailySchedules) {
        // Delete existing daily schedules
        await tx.workScheduleDay.deleteMany({
          where: { scheduleId: id },
        });

        // Create new daily schedules
        await tx.workScheduleDay.createMany({
          data: dailySchedules.map((day) => ({
            scheduleId: id,
            dayOfWeek: day.dayOfWeek,
            hoursPerDay: day.hoursPerDay,
            startTime: day.startTime,
            endTime: day.endTime,
            isWorkingDay: day.isWorkingDay,
          })),
        });
      }

      // Update main schedule
      return tx.workSchedule.update({
        where: { id },
        data: scheduleData,
        include: {
          dailySchedules: {
            orderBy: { dayOfWeek: 'asc' },
          },
          _count: {
            select: { assignedUsers: true },
          },
        },
      });
    });

    return schedule as unknown as WorkScheduleDetailResponse;
  }

  /**
   * Delete a work schedule
   */
  async delete(organizationId: string, id: string): Promise<void> {
    const existing = await this.prisma.workSchedule.findFirst({
      where: { id, organizationId },
      include: { _count: { select: { assignedUsers: true } } },
    });

    if (!existing) {
      throw new NotFoundException(`Work schedule with ID ${id} not found`);
    }

    if (existing._count.assignedUsers > 0) {
      throw new ConflictException(
        `Cannot delete schedule with ${existing._count.assignedUsers} assigned users`,
      );
    }

    await this.prisma.workSchedule.delete({ where: { id } });
  }

  /**
   * Assign schedule to users
   */
  async assignToUsers(
    organizationId: string,
    scheduleId: string,
    data: AssignScheduleRequest,
    assignedById: string,
  ): Promise<{ assigned: number }> {
    const schedule = await this.prisma.workSchedule.findFirst({
      where: { id: scheduleId, organizationId },
    });

    if (!schedule) {
      throw new NotFoundException(
        `Work schedule with ID ${scheduleId} not found`,
      );
    }

    // Deactivate existing schedules for these users
    await this.prisma.userWorkSchedule.updateMany({
      where: {
        userId: { in: data.userIds },
        isActive: true,
      },
      data: { isActive: false },
    });

    // Create new assignments
    const result = await this.prisma.userWorkSchedule.createMany({
      data: data.userIds.map((userId) => ({
        userId,
        scheduleId,
        assignedBy: assignedById,
        isActive: true,
      })),
      skipDuplicates: true,
    });

    return { assigned: result.count };
  }

  /**
   * Unassign schedule from users
   */
  async unassignFromUsers(
    organizationId: string,
    scheduleId: string,
    userIds: string[],
  ): Promise<{ unassigned: number }> {
    const schedule = await this.prisma.workSchedule.findFirst({
      where: { id: scheduleId, organizationId },
    });

    if (!schedule) {
      throw new NotFoundException(
        `Work schedule with ID ${scheduleId} not found`,
      );
    }

    const result = await this.prisma.userWorkSchedule.deleteMany({
      where: {
        scheduleId,
        userId: { in: userIds },
      },
    });

    return { unassigned: result.count };
  }
}
