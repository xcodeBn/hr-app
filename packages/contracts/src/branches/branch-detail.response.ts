import { z } from 'zod';
import { branchSchema } from './branch.schema';

// Response for GET /organizations/:orgId/branches/:id
export const branchDetailResponseSchema = branchSchema.extend({
  _count: z.object({
    departments: z.number(),
  }),
});

export type BranchDetailResponse = z.infer<typeof branchDetailResponseSchema>;
