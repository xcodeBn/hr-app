import { z } from 'zod';
import { employmentTypeSchema } from './employment.schema';

export const updateEmploymentRequestSchema = z.object({
  employeeId: z.string().min(1).optional(),
  jobTitleId: z.uuid().optional(),
  employmentType: employmentTypeSchema.optional(),
  lineManagerId: z.uuid().nullable().optional(),
  departmentId: z.uuid().nullable().optional(),
  effectiveDate: z.coerce.date().optional(),
  endDate: z.coerce.date().nullable().optional(),
  isActive: z.boolean().optional(),
});

export type UpdateEmploymentRequest = z.infer<
  typeof updateEmploymentRequestSchema
>;
