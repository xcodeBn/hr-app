import { z } from 'zod';
import { dateSchema } from '../common';

// Base branch schema for reuse
export const branchSchema = z.object({
  id: z.uuid(),
  organizationId: z.uuid(),
  name: z.string(),
  street1: z.string().nullable(),
  street2: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  postalCode: z.string().nullable(),
  country: z.string(),
  phoneNumber: z.string().nullable(),
  email: z.string().nullable(),
  createdAt: dateSchema,
  updatedAt: dateSchema,
});

export type Branch = z.infer<typeof branchSchema>;
