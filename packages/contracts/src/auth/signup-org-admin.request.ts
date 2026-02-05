import { z } from 'zod';

export const signupOrgAdminRequestSchema = z.object({
  // User details
  name: z.string().min(2, { error: 'Name must be at least 2 characters' }),
  email: z.email({ error: 'Invalid email address' }),
  password: z
    .string()
    .min(8, { error: 'Password must be at least 8 characters' }),

  // Organization details
  organizationName: z
    .string()
    .min(2, { error: 'Organization name must be at least 2 characters' }),
  organizationDescription: z.string().optional(),
  organizationWebsite: z
    .union([z.url({ error: 'Invalid website URL' }), z.literal('')])
    .optional()
    .transform((val) => (val === '' ? undefined : val)),
});

export type SignupOrgAdminRequest = z.infer<typeof signupOrgAdminRequestSchema>;
