import { z } from 'zod';
import { branchSchema } from './branch.schema';

// Response for GET /organizations/:orgId/branches
export const branchListResponseSchema = z.object({
  branches: z.array(
    branchSchema.extend({
      _count: z.object({
        departments: z.number(),
      }),
    }),
  ),
  total: z.number(),
});

export type BranchListResponse = z.infer<typeof branchListResponseSchema>;
