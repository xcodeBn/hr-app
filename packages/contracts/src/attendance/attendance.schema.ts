import { z } from 'zod';
import { dateSchema, decimalSchema } from '../common';

export const attendanceStatusSchema = z.enum([
  'PENDING',
  'COMPLETED',
  'APPROVED',
  'REJECTED',
  'ABSENT',
]);

export type AttendanceStatus = z.infer<typeof attendanceStatusSchema>;

export const attendanceSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  organizationId: z.uuid(),
  date: dateSchema,
  clockIn: dateSchema.nullable(),
  clockInLocation: z.string().nullable(),
  clockInTimezone: z.string().nullable(),
  clockOut: dateSchema.nullable(),
  clockOutLocation: z.string().nullable(),
  clockOutTimezone: z.string().nullable(),
  scheduledHours: decimalSchema,
  loggedHours: decimalSchema,
  paidHours: decimalSchema,
  deficitHours: decimalSchema,
  overtimeHours: decimalSchema,
  status: attendanceStatusSchema,
  notes: z.string().nullable(),
  createdAt: dateSchema,
  updatedAt: dateSchema,
});

export type Attendance = z.infer<typeof attendanceSchema>;
