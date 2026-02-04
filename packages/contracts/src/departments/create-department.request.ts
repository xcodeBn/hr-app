import { z } from 'zod';

export const createDepartmentRequestSchema = z.object({
  name: z.string().min(1, { error: 'Department name is required' }),
  description: z.string().optional(),
});

export type CreateDepartmentRequest = z.infer<
  typeof createDepartmentRequestSchema
>;
