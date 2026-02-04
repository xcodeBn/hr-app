import { z } from 'zod';

// Request for POST /organizations/:orgId/branches
export const createBranchRequestSchema = z.object({
  name: z.string().min(1, { error: 'Branch name is required' }),
  street1: z.string().optional(),
  street2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().min(1, { error: 'Country is required' }),
  phoneNumber: z.string().optional(),
  email: z.email().optional(),
});

export type CreateBranchRequest = z.infer<typeof createBranchRequestSchema>;
