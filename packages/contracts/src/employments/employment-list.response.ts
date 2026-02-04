import { z } from 'zod';
import { employmentSchema } from './employment.schema';

const employmentWithRelationsSchema = employmentSchema.extend({
  user: z.object({
    id: z.uuid(),
    name: z.string(),
    email: z.string(),
  }),
  jobTitle: z.object({
    id: z.uuid(),
    title: z.string(),
  }),
  department: z
    .object({
      id: z.uuid(),
      name: z.string(),
    })
    .nullable(),
  lineManager: z
    .object({
      id: z.uuid(),
      name: z.string(),
    })
    .nullable(),
});

export const employmentListResponseSchema = z.object({
  employments: z.array(employmentWithRelationsSchema),
  total: z.number(),
});

export type EmploymentListResponse = z.infer<
  typeof employmentListResponseSchema
>;
