import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import type {
  AttendanceListResponse,
  AttendanceDetailResponse,
  ClockInRequest,
  ClockOutRequest,
} from '@repo/contracts';
import type { AttendanceStatus } from '@repo/db';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get attendance records for an organization with filters
   */
  async findAll(options: {
    organizationId: string;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }): Promise<AttendanceListResponse> {
    const {
      organizationId,
      userId,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = options;
    const skip = (page - 1) * limit;

    const where: {
      organizationId: string;
      userId?: string;
      date?: { gte?: Date; lte?: Date };
    } = { organizationId };

    if (userId) {
      where.userId = userId;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = startDate;
      if (endDate) where.date.lte = endDate;
    }

    const [attendances, total] = await Promise.all([
      this.prisma.attendance.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      this.prisma.attendance.count({ where }),
    ]);

    return {
      attendances:
        attendances as unknown as AttendanceListResponse['attendances'],
      total,
    };
  }

  /**
   * Get a single attendance record
   */
  async findOne(id: string): Promise<AttendanceDetailResponse> {
    const attendance = await this.prisma.attendance.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!attendance) {
      throw new NotFoundException(`Attendance record with ID ${id} not found`);
    }

    return attendance as unknown as AttendanceDetailResponse;
  }

  /**
   * Clock in for the current user
   */
  async clockIn(
    userId: string,
    organizationId: string,
    data: ClockInRequest,
  ): Promise<AttendanceDetailResponse> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already clocked in today
    const existing = await this.prisma.attendance.findUnique({
      where: { userId_date: { userId, date: today } },
    });

    if (existing) {
      throw new BadRequestException('Already clocked in today');
    }

    // Get user's scheduled hours from work schedule
    const scheduledHours = await this.getScheduledHours(userId, today);

    const attendance = await this.prisma.attendance.create({
      data: {
        userId,
        organizationId,
        date: today,
        clockIn: new Date(),
        clockInLocation: data.location,
        clockInTimezone: data.timezone,
        scheduledHours,
        loggedHours: 0,
        paidHours: 0,
        deficitHours: scheduledHours,
        notes: data.notes,
        status: 'PENDING',
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return attendance as unknown as AttendanceDetailResponse;
  }

  /**
   * Clock out for the current user
   */
  async clockOut(
    userId: string,
    data: ClockOutRequest,
  ): Promise<AttendanceDetailResponse> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await this.prisma.attendance.findUnique({
      where: { userId_date: { userId, date: today } },
    });

    if (!existing) {
      throw new BadRequestException('No clock-in record found for today');
    }

    if (existing.clockOut) {
      throw new BadRequestException('Already clocked out today');
    }

    const clockOut = new Date();
    const clockIn = existing.clockIn!;

    // Calculate logged hours
    const diffMs = clockOut.getTime() - clockIn.getTime();
    const loggedHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;

    // Calculate paid hours, deficit, and overtime
    const scheduledHours = Number(existing.scheduledHours);
    const paidHours = Math.min(loggedHours, scheduledHours);
    const deficitHours = Math.max(scheduledHours - loggedHours, 0);
    const overtimeHours = Math.max(loggedHours - scheduledHours, 0);

    const attendance = await this.prisma.attendance.update({
      where: { id: existing.id },
      data: {
        clockOut,
        clockOutLocation: data.location,
        clockOutTimezone: data.timezone,
        loggedHours,
        paidHours,
        deficitHours,
        overtimeHours,
        status: 'COMPLETED',
        notes: data.notes
          ? `${existing.notes || ''}\n${data.notes}`.trim()
          : existing.notes,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return attendance as unknown as AttendanceDetailResponse;
  }

  /**
   * Update attendance (admin only)
   */
  async update(
    id: string,
    data: { status?: AttendanceStatus; notes?: string | null },
  ): Promise<AttendanceDetailResponse> {
    const existing = await this.prisma.attendance.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Attendance record with ID ${id} not found`);
    }

    const attendance = await this.prisma.attendance.update({
      where: { id },
      data,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return attendance as unknown as AttendanceDetailResponse;
  }

  /**
   * Approve attendance record
   */
  async approve(id: string): Promise<AttendanceDetailResponse> {
    return this.update(id, { status: 'APPROVED' });
  }

  /**
   * Reject attendance record
   */
  async reject(id: string): Promise<AttendanceDetailResponse> {
    return this.update(id, { status: 'REJECTED' });
  }

  /**
   * Get scheduled hours for a user on a specific date
   */
  private async getScheduledHours(userId: string, date: Date): Promise<number> {
    const dayOfWeek = date.getDay();

    // Find user's active schedule assignment via UserWorkSchedule join table
    const assignment = await this.prisma.userWorkSchedule.findFirst({
      where: {
        userId,
        isActive: true,
        schedule: {
          isActive: true,
          effectiveFrom: { lte: date },
          OR: [{ effectiveTo: null }, { effectiveTo: { gte: date } }],
        },
      },
      include: {
        schedule: {
          include: {
            dailySchedules: {
              where: { dayOfWeek },
            },
          },
        },
      },
    });

    if (assignment?.schedule.dailySchedules[0]) {
      const daySchedule = assignment.schedule.dailySchedules[0];
      if (daySchedule.isWorkingDay) {
        return Number(daySchedule.hoursPerDay);
      }
      // Non-working day
      return 0;
    }

    // Default to 8 hours if no schedule found
    return 8;
  }
}
