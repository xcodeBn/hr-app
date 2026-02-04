import { z } from 'zod';
import { dateSchema } from '../common';

export const jobTitleSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  createdAt: dateSchema,
  updatedAt: dateSchema,
});

export type JobTitle = z.infer<typeof jobTitleSchema>;
