import { z } from 'zod';
import {
  permissionAccessSchema,
  permissionCodeSchema,
} from './permission-access.schema';

/**
 * Permission assignment for creating/updating roles
 */
export const permissionAssignmentSchema = z.object({
  permissionCode: permissionCodeSchema,
  accessLevel: permissionAccessSchema,
});
export type PermissionAssignment = z.infer<typeof permissionAssignmentSchema>;

/**
 * Create a new organization role
 */
export const createOrgRoleRequestSchema = z.object({
  name: z.string().min(1, { error: 'Role name is required' }).max(100),
  description: z.string().max(500).optional(),
  isDefault: z.boolean().optional().default(false),
  permissions: z.array(permissionAssignmentSchema).optional().default([]),
});
export type CreateOrgRoleRequest = z.infer<typeof createOrgRoleRequestSchema>;

/**
 * Update an existing organization role
 */
export const updateOrgRoleRequestSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
  isDefault: z.boolean().optional(),
  permissions: z.array(permissionAssignmentSchema).optional(),
});
export type UpdateOrgRoleRequest = z.infer<typeof updateOrgRoleRequestSchema>;

/**
 * Assign role to user
 */
export const assignRoleRequestSchema = z.object({
  userId: z.uuid(),
  roleId: z.uuid(),
});
export type AssignRoleRequest = z.infer<typeof assignRoleRequestSchema>;

/**
 * Bulk assign role to multiple users
 */
export const bulkAssignRoleRequestSchema = z.object({
  userIds: z.array(z.uuid()).min(1),
  roleId: z.uuid(),
});
export type BulkAssignRoleRequest = z.infer<typeof bulkAssignRoleRequestSchema>;
