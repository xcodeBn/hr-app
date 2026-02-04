import { z } from 'zod';
import { dateSchema, decimalSchema } from '../common';

export const workScheduleTypeSchema = z.enum([
  'DURATION_BASED',
  'TIME_BASED',
  'FLEXIBLE',
]);

export type WorkScheduleType = z.infer<typeof workScheduleTypeSchema>;

export const workScheduleDaySchema = z.object({
  id: z.uuid(),
  scheduleId: z.uuid(),
  dayOfWeek: z.number().min(0).max(6), // 0-6 (Sunday-Saturday)
  hoursPerDay: decimalSchema, // Decimal from Prisma
  startTime: z.string().nullable(), // "09:00"
  endTime: z.string().nullable(), // "17:00"
  isWorkingDay: z.boolean(),
  createdAt: dateSchema,
  updatedAt: dateSchema,
});

export type WorkScheduleDay = z.infer<typeof workScheduleDaySchema>;

export const workScheduleSchema = z.object({
  id: z.uuid(),
  organizationId: z.uuid(),
  name: z.string(),
  scheduleType: workScheduleTypeSchema,
  isDefault: z.boolean(),
  standardHoursPerDay: decimalSchema.nullable(),
  totalWeeklyHours: decimalSchema,
  effectiveFrom: dateSchema,
  effectiveTo: dateSchema.nullable(),
  isActive: z.boolean(),
  createdAt: dateSchema,
  updatedAt: dateSchema,
});

export type WorkSchedule = z.infer<typeof workScheduleSchema>;
