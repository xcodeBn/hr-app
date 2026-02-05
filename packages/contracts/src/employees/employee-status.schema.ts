import { z } from 'zod';

/**
 * Employee Status - represents the current work status of an employee
 * - ACTIVE: Currently working normally
 * - ON_BOARDING: New hire in onboarding process
 * - PROBATION: In probationary period
 * - ON_LEAVE: Currently on leave (vacation, sick, etc.)
 * - TERMINATED: No longer employed
 */
export const employeeStatusSchema = z.enum([
  'ACTIVE',
  'ON_BOARDING',
  'PROBATION',
  'ON_LEAVE',
  'TERMINATED',
]);
export type EmployeeStatus = z.infer<typeof employeeStatusSchema>;

/**
 * Account Status - represents the user account activation status
 * - ACTIVATED: User has confirmed their account
 * - NEED_INVITATION: User needs to be invited/re-invited
 * - PENDING: Invitation sent, awaiting confirmation
 */
export const accountStatusSchema = z.enum([
  'ACTIVATED',
  'NEED_INVITATION',
  'PENDING',
]);
export type AccountStatus = z.infer<typeof accountStatusSchema>;
