import { z } from 'zod';
import { employmentTypeSchema } from './employment.schema';

export const createEmploymentRequestSchema = z.object({
  userId: z.uuid(),
  employeeId: z.string().min(1, { error: 'Employee ID is required' }),
  jobTitleId: z.uuid(),
  employmentType: employmentTypeSchema,
  lineManagerId: z.uuid().optional(),
  departmentId: z.uuid().optional(),
  effectiveDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
});

export type CreateEmploymentRequest = z.infer<
  typeof createEmploymentRequestSchema
>;
