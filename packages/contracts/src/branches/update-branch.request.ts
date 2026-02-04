import { z } from 'zod';

// Request for PATCH /organizations/:orgId/branches/:id
export const updateBranchRequestSchema = z.object({
  name: z.string().min(1).optional(),
  street1: z.string().nullable().optional(),
  street2: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  postalCode: z.string().nullable().optional(),
  country: z.string().min(1).optional(),
  phoneNumber: z.string().nullable().optional(),
  email: z.email().nullable().optional(),
});

export type UpdateBranchRequest = z.infer<typeof updateBranchRequestSchema>;
