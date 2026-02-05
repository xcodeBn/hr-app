import { z } from 'zod';
import { userRoleSchema } from '../users';
import { organizationStatusSchema } from '../organizations';
import { dateSchema } from '../common';

export const signupOrgAdminResponseSchema = z.object({
  user: z.object({
    id: z.uuid(),
    email: z.email(),
    name: z.string(),
    role: userRoleSchema,
    isConfirmed: z.boolean(),
  }),
  organization: z.object({
    id: z.uuid(),
    name: z.string(),
    status: organizationStatusSchema,
    createdAt: dateSchema,
  }),
  message: z.string(),
});

export type SignupOrgAdminResponse = z.infer<
  typeof signupOrgAdminResponseSchema
>;
