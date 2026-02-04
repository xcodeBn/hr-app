import { z } from 'zod';

export const updateDepartmentRequestSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
});

export type UpdateDepartmentRequest = z.infer<
  typeof updateDepartmentRequestSchema
>;
