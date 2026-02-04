import { z } from 'zod';
import { jobTitleSchema } from './job-title.schema';

export const jobTitleListResponseSchema = z.object({
  jobTitles: z.array(
    jobTitleSchema.extend({
      _count: z.object({
        employments: z.number(),
      }),
    }),
  ),
  total: z.number(),
});

export type JobTitleListResponse = z.infer<typeof jobTitleListResponseSchema>;
