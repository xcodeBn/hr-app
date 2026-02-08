import { z } from 'zod';
import { dateSchema } from '../common';
import {
  permissionAccessSchema,
  permissionCodeSchema,
  permissionSectionSchema,
} from './permission-access.schema';

/**
 * Permission detail in a role response
 */
export const permissionDetailSchema = z.object({
  id: z.uuid(),
  code: permissionCodeSchema,
  section: permissionSectionSchema,
  name: z.string(),
  description: z.string().nullable(),
  accessLevel: permissionAccessSchema,
});
export type PermissionDetail = z.infer<typeof permissionDetailSchema>;

/**
 * Organization role detail response
 */
export const orgRoleDetailResponseSchema = z.object({
  id: z.uuid(),
  organizationId: z.uuid(),
  name: z.string(),
  description: z.string().nullable(),
  isDefault: z.boolean(),
  isSystemRole: z.boolean(),
  permissions: z.array(permissionDetailSchema),
  memberCount: z.number().int().optional(),
  createdAt: dateSchema,
  updatedAt: dateSchema,
});
export type OrgRoleDetailResponse = z.infer<typeof orgRoleDetailResponseSchema>;

/**
 * Organization role list item (without full permissions)
 */
export const orgRoleListItemSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  description: z.string().nullable(),
  isDefault: z.boolean(),
  isSystemRole: z.boolean(),
  memberCount: z.number().int(),
  createdAt: dateSchema,
});
export type OrgRoleListItem = z.infer<typeof orgRoleListItemSchema>;

/**
 * Organization role list response
 */
export const orgRoleListResponseSchema = z.object({
  roles: z.array(orgRoleListItemSchema),
  total: z.number().int(),
});
export type OrgRoleListResponse = z.infer<typeof orgRoleListResponseSchema>;

/**
 * Available permissions grouped by section
 */
export const permissionGroupSchema = z.object({
  section: permissionSectionSchema,
  permissions: z.array(
    z.object({
      id: z.uuid(),
      code: permissionCodeSchema,
      name: z.string(),
      description: z.string().nullable(),
    }),
  ),
});
export type PermissionGroup = z.infer<typeof permissionGroupSchema>;

export const availablePermissionsResponseSchema = z.object({
  groups: z.array(permissionGroupSchema),
});
export type AvailablePermissionsResponse = z.infer<
  typeof availablePermissionsResponseSchema
>;
