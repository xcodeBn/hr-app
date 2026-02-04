import { z } from 'zod';
import { attendanceStatusSchema } from './attendance.schema';

export const updateAttendanceRequestSchema = z.object({
  clockIn: z.coerce.date().optional(),
  clockOut: z.coerce.date().optional(),
  status: attendanceStatusSchema.optional(),
  notes: z.string().nullable().optional(),
});

export type UpdateAttendanceRequest = z.infer<
  typeof updateAttendanceRequestSchema
>;
