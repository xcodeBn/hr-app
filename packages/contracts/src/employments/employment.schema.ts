import { z } from 'zod';
import { dateSchema } from '../common';

export const employmentTypeSchema = z.enum([
  'FULLTIME',
  'PARTTIME',
  'CONTRACT',
  'INTERN',
  'FREELANCE',
]);

export type EmploymentType = z.infer<typeof employmentTypeSchema>;

export const employmentSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  employeeId: z.string(),
  jobTitleId: z.uuid(),
  employmentType: employmentTypeSchema,
  lineManagerId: z.uuid().nullable(),
  departmentId: z.uuid().nullable(),
  effectiveDate: dateSchema,
  endDate: dateSchema.nullable(),
  isActive: z.boolean(),
  createdAt: dateSchema,
  updatedAt: dateSchema,
});

export type Employment = z.infer<typeof employmentSchema>;
