import { z } from 'zod';
import { workScheduleTypeSchema } from './work-schedule.schema';

const dailyScheduleUpdateSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  hoursPerDay: z.number().min(0).max(24),
  startTime: z.string().nullable().optional(),
  endTime: z.string().nullable().optional(),
  isWorkingDay: z.boolean(),
});

export const updateWorkScheduleRequestSchema = z.object({
  name: z.string().min(1).optional(),
  scheduleType: workScheduleTypeSchema.optional(),
  isDefault: z.boolean().optional(),
  standardHoursPerDay: z.number().min(0).max(24).nullable().optional(),
  totalWeeklyHours: z.number().min(0).max(168).optional(),
  effectiveFrom: z.coerce.date().optional(),
  effectiveTo: z.coerce.date().nullable().optional(),
  isActive: z.boolean().optional(),
  dailySchedules: z.array(dailyScheduleUpdateSchema).min(1).max(7).optional(),
});

export type UpdateWorkScheduleRequest = z.infer<
  typeof updateWorkScheduleRequestSchema
>;
