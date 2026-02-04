import { z } from 'zod';
import { workScheduleTypeSchema } from './work-schedule.schema';

const dailyScheduleInputSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  hoursPerDay: z.number().min(0).max(24),
  startTime: z.string().optional(), // "09:00"
  endTime: z.string().optional(), // "17:00"
  isWorkingDay: z.boolean(),
});

export const createWorkScheduleRequestSchema = z.object({
  name: z.string().min(1, { error: 'Schedule name is required' }),
  scheduleType: workScheduleTypeSchema.default('DURATION_BASED'),
  isDefault: z.boolean().default(false),
  standardHoursPerDay: z.number().min(0).max(24).optional(),
  totalWeeklyHours: z.number().min(0).max(168), // Max 24*7
  effectiveFrom: z.coerce.date(),
  effectiveTo: z.coerce.date().optional(),
  dailySchedules: z.array(dailyScheduleInputSchema).min(1).max(7),
});

export type CreateWorkScheduleRequest = z.infer<
  typeof createWorkScheduleRequestSchema
>;
