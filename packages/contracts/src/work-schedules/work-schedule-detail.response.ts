import { z } from 'zod';
import {
  workScheduleSchema,
  workScheduleDaySchema,
} from './work-schedule.schema';

export const workScheduleDetailResponseSchema = workScheduleSchema.extend({
  dailySchedules: z.array(workScheduleDaySchema),
  _count: z.object({
    assignedUsers: z.number(),
  }),
});

export type WorkScheduleDetailResponse = z.infer<
  typeof workScheduleDetailResponseSchema
>;
