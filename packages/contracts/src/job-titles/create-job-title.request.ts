import { z } from 'zod';

export const createJobTitleRequestSchema = z.object({
  title: z.string().min(1, { error: 'Job title is required' }),
});

export type CreateJobTitleRequest = z.infer<typeof createJobTitleRequestSchema>;
