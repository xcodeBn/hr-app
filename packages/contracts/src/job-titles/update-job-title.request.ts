import { z } from 'zod';

export const updateJobTitleRequestSchema = z.object({
  title: z.string().min(1, { error: 'Job title is required' }),
});

export type UpdateJobTitleRequest = z.infer<typeof updateJobTitleRequestSchema>;
