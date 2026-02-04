import { z } from 'zod';
import { employmentSchema } from './employment.schema';

export const employmentDetailResponseSchema = employmentSchema.extend({
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

export type EmploymentDetailResponse = z.infer<
  typeof employmentDetailResponseSchema
>;
