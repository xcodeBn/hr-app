import { z } from 'zod';
import { attendanceSchema } from './attendance.schema';

const attendanceWithUserSchema = attendanceSchema.extend({
  user: z.object({
    id: z.uuid(),
    name: z.string(),
    email: z.email(),
  }),
});

export const attendanceListResponseSchema = z.object({
  attendances: z.array(attendanceWithUserSchema),
  total: z.number(),
});

export type AttendanceListResponse = z.infer<
  typeof attendanceListResponseSchema
>;
