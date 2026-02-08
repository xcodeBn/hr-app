import { z } from 'zod';

/**
 * Permission access levels for organization roles
 */
export const permissionAccessSchema = z.enum([
  'NO_ACCESS',
  'VIEW_ONLY',
  'VIEW_EDIT',
]);
export type PermissionAccess = z.infer<typeof permissionAccessSchema>;

/**
 * All available permission codes in the system
 * Organized by section for UI grouping
 */
export const permissionCodeSchema = z.enum([
  // Profile section
  'profile:picture',
  'profile:personal_info',
  'profile:address',
  'profile:emergency_contact',

  // Employment section
  'employment:job_info',
  'employment:contract',
  'employment:bank_info',
  'employment:offboarding',

  // Attendance section
  'attendance:view',
  'attendance:manage',
  'attendance:approve',

  // Documents section
  'documents:view',
  'documents:upload',
  'documents:delete',

  // Time Off section
  'time_off:view',
  'time_off:request',
  'time_off:approve',

  // Employees section (manage other employees)
  'employees:view',
  'employees:create',
  'employees:edit',
  'employees:delete',
  'employees:invite',

  // Departments section
  'departments:view',
  'departments:manage',

  // Branches section
  'branches:view',
  'branches:manage',

  // Reports section
  'reports:view',
  'reports:export',

  // Settings section
  'settings:view',
  'settings:manage',

  // Roles section
  'roles:view',
  'roles:manage',
]);
export type PermissionCode = z.infer<typeof permissionCodeSchema>;

/**
 * Permission section groupings for UI organization
 */
export const permissionSectionSchema = z.enum([
  'Profile',
  'Employment',
  'Attendance',
  'Documents',
  'Time Off',
  'Employees',
  'Departments',
  'Branches',
  'Reports',
  'Settings',
  'Roles',
]);
export type PermissionSection = z.infer<typeof permissionSectionSchema>;
