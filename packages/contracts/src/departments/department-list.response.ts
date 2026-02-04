import { z } from 'zod';
import { departmentSchema } from './department.schema';

export const departmentListResponseSchema = z.object({
  departments: z.array(
    departmentSchema.extend({
      _count: z.object({
        users: z.number(),
        employments: z.number(),
      }),
    }),
  ),
  total: z.number(),
});

export type DepartmentListResponse = z.infer<
  typeof departmentListResponseSchema
>;
