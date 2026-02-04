import { z } from 'zod';

export const assignScheduleRequestSchema = z.object({
  userIds: z.array(z.uuid()).min(1, { error: 'At least one user is required' }),
});

export type AssignScheduleRequest = z.infer<typeof assignScheduleRequestSchema>;

export const unassignScheduleRequestSchema = z.object({
  userIds: z.array(z.uuid()).min(1, { error: 'At least one user is required' }),
});

export type UnassignScheduleRequest = z.infer<
  typeof unassignScheduleRequestSchema
>;
