import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';
import { PrismaService } from '../database/prisma.service';
import type { PermissionAccess, PermissionCode } from '@repo/contracts';
import type { User } from '@repo/db';

const PERMISSION_CACHE_PREFIX = 'user_permissions:';
const PERMISSION_CACHE_TTL = 5 * 60; // 5 minutes

const ACCESS_LEVEL_ORDER: Record<PermissionAccess, number> = {
  NO_ACCESS: 0,
  VIEW_ONLY: 1,
  VIEW_EDIT: 2,
};

interface CachedPermission {
  code: PermissionCode;
  accessLevel: PermissionAccess;
}

/**
 * Service for checking permissions programmatically
 * Use this when you need to check permissions in service logic,
 * or for the "self or permission" pattern
 */
@Injectable()
export class PermissionsCheckService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  /**
   * Check if a user has a specific permission
   * Returns true if:
   * - User is SUPER_ADMIN
   * - User is ORG_ADMIN
   * - User's org role has the required permission with sufficient access level
   */
  async hasPermission(
    user: User,
    permissionCode: PermissionCode,
    minAccessLevel: PermissionAccess = 'VIEW_ONLY',
  ): Promise<boolean> {
    // SUPER_ADMIN and ORG_ADMIN bypass permission checks
    if (user.role === 'SUPER_ADMIN' || user.role === 'ORG_ADMIN') {
      return true;
    }

    if (!user.organizationId) {
      return false;
    }

    const permissions = await this.getUserPermissions(
      user.id,
      user.organizationId,
    );
    return this.checkPermission(permissions, permissionCode, minAccessLevel);
  }

  /**
   * Check if user can access a resource (either self or has permission)
   * Common pattern: user can view/edit their own data, OR needs permission for others
   */
  async canAccessUserResource(
    currentUser: User,
    targetUserId: string,
    permissionCode: PermissionCode,
    minAccessLevel: PermissionAccess = 'VIEW_ONLY',
  ): Promise<boolean> {
    // User can always access their own resources
    if (currentUser.id === targetUserId) {
      return true;
    }

    // For other users' resources, check permission
    return this.hasPermission(currentUser, permissionCode, minAccessLevel);
  }

  /**
   * Get the access level a user has for a specific permission
   * Returns null if no access
   */
  async getAccessLevel(
    user: User,
    permissionCode: PermissionCode,
  ): Promise<PermissionAccess | null> {
    if (user.role === 'SUPER_ADMIN' || user.role === 'ORG_ADMIN') {
      return 'VIEW_EDIT'; // Full access for admins
    }

    if (!user.organizationId) {
      return null;
    }

    const permissions = await this.getUserPermissions(
      user.id,
      user.organizationId,
    );
    const permission = permissions.find((p) => p.code === permissionCode);

    return permission?.accessLevel ?? null;
  }

  private async getUserPermissions(
    userId: string,
    organizationId: string,
  ): Promise<CachedPermission[]> {
    const cacheKey = `${PERMISSION_CACHE_PREFIX}${userId}:${organizationId}`;

    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached) as CachedPermission[];
    }

    const userRoles = await this.prisma.userOrgRole.findMany({
      where: {
        userId,
        role: { organizationId },
      },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    const permissionMap = new Map<PermissionCode, PermissionAccess>();

    for (const userRole of userRoles) {
      for (const rp of userRole.role.rolePermissions) {
        const code = rp.permission.code as PermissionCode;
        const accessLevel = rp.accessLevel as PermissionAccess;
        const existing = permissionMap.get(code);

        const existingLevel = existing
          ? (ACCESS_LEVEL_ORDER[existing] ?? -1)
          : -1;
        const newLevel = ACCESS_LEVEL_ORDER[accessLevel] ?? 0;

        if (newLevel > existingLevel) {
          permissionMap.set(code, accessLevel);
        }
      }
    }

    const permissions: CachedPermission[] = Array.from(
      permissionMap.entries(),
    ).map(([code, accessLevel]) => ({ code, accessLevel }));

    await this.redis.setex(
      cacheKey,
      PERMISSION_CACHE_TTL,
      JSON.stringify(permissions),
    );

    return permissions;
  }

  private checkPermission(
    userPermissions: CachedPermission[],
    requiredCode: PermissionCode,
    requiredAccessLevel: PermissionAccess,
  ): boolean {
    const permission = userPermissions.find((p) => p.code === requiredCode);

    if (!permission) {
      return false;
    }

    const userLevel = ACCESS_LEVEL_ORDER[permission.accessLevel] ?? 0;
    const requiredLevel = ACCESS_LEVEL_ORDER[requiredAccessLevel] ?? 0;

    return userLevel >= requiredLevel;
  }
}
