import { z } from 'zod';
import { departmentSchema } from './department.schema';

export const departmentDetailResponseSchema = departmentSchema.extend({
  _count: z.object({
    users: z.number(),
    employments: z.number(),
  }),
});

export type DepartmentDetailResponse = z.infer<
  typeof departmentDetailResponseSchema
>;
