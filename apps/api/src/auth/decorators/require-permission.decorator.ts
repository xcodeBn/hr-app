import { SetMetadata } from '@nestjs/common';
import type { PermissionCode, PermissionAccess } from '@repo/contracts';

export const PERMISSION_KEY = 'required_permission';

export interface RequiredPermission {
  code: PermissionCode;
  minAccessLevel: PermissionAccess;
}

/**
 * Decorator to require a specific permission for a route.
 * This checks the user's organization role permissions.
 *
 * SUPER_ADMIN users bypass permission checks.
 * ORG_ADMIN users have all permissions by default.
 *
 * @param code - The permission code to check (e.g., 'employees:view')
 * @param minAccessLevel - Minimum access level required (default: 'VIEW_ONLY')
 *
 * @example
 * // Require VIEW_ONLY access to employees
 * @RequirePermission('employees:view')
 * @Get('employees')
 * listEmployees() { ... }
 *
 * @example
 * // Require VIEW_EDIT access to employees
 * @RequirePermission('employees:edit', 'VIEW_EDIT')
 * @Patch('employees/:id')
 * updateEmployee() { ... }
 */
export const RequirePermission = (
  code: PermissionCode,
  minAccessLevel: PermissionAccess = 'VIEW_ONLY',
) =>
  SetMetadata(PERMISSION_KEY, { code, minAccessLevel } as RequiredPermission);
