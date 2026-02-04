import { z } from 'zod';
import { attendanceSchema } from './attendance.schema';

export const attendanceDetailResponseSchema = attendanceSchema.extend({
  user: z.object({
    id: z.uuid(),
    name: z.string(),
    email: z.email(),
  }),
});

export type AttendanceDetailResponse = z.infer<
  typeof attendanceDetailResponseSchema
>;
