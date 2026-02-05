import { z } from 'zod';
import { dateSchema } from '../common';
import { userRoleSchema } from './user-role.schema';

// Base user schema shared across API contracts
export const userSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  name: z.string().nullable(),
  role: userRoleSchema,
  organizationId: z.uuid().nullable(),
  departmentId: z.uuid().nullable(),
  isConfirmed: z.boolean(),
  createdAt: dateSchema,
  updatedAt: dateSchema,
});

export type User = z.infer<typeof userSchema>;
