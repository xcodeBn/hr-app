import { z } from 'zod';
import { dateSchema } from '../common';

export const departmentSchema = z.object({
  id: z.uuid(),
  branchId: z.uuid(),
  name: z.string(),
  description: z.string().nullable(),
  createdAt: dateSchema,
  updatedAt: dateSchema,
});

export type Department = z.infer<typeof departmentSchema>;
