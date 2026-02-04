import { z } from 'zod';
import { workScheduleSchema } from './work-schedule.schema';

export const workScheduleListResponseSchema = z.object({
  schedules: z.array(
    workScheduleSchema.extend({
      _count: z.object({
        dailySchedules: z.number(),
        assignedUsers: z.number(),
      }),
    }),
  ),
  total: z.number(),
});

export type WorkScheduleListResponse = z.infer<
  typeof workScheduleListResponseSchema
>;
