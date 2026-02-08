import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import Redis from 'ioredis';
import { PrismaService } from '../../database/prisma.service';
import { PERMISSION_KEY, type RequiredPermission } from '../decorators';
import type { AuthenticatedRequest } from './auth.guard';
import type { PermissionAccess, PermissionCode } from '@repo/contracts';

const PERMISSION_CACHE_PREFIX = 'user_permissions:';
const PERMISSION_CACHE_TTL = 5 * 60; // 5 minutes

/**
 * Access level hierarchy for comparison
 */
const ACCESS_LEVEL_ORDER: Record<PermissionAccess, number> = {
  NO_ACCESS: 0,
  VIEW_ONLY: 1,
  VIEW_EDIT: 2,
};

/**
 * Cached permission entry
 */
interface CachedPermission {
  code: PermissionCode;
  accessLevel: PermissionAccess;
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission =
      this.reflector.getAllAndOverride<RequiredPermission>(PERMISSION_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);

    // If no permission is required, allow access
    if (!requiredPermission) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not found in request');
    }

    // SUPER_ADMIN bypasses all permission checks
    if (user.role === 'SUPER_ADMIN') {
      return true;
    }

    // ORG_ADMIN has all permissions within their organization
    if (user.role === 'ORG_ADMIN') {
      return true;
    }

    // For EMPLOYEE role, check organization-specific permissions
    if (!user.organizationId) {
      throw new ForbiddenException('User must belong to an organization');
    }

    const userPermissions = await this.getUserPermissions(
      user.id,
      user.organizationId,
    );
    const hasPermission = this.checkPermission(
      userPermissions,
      requiredPermission.code,
      requiredPermission.minAccessLevel,
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `Access denied. Required permission: ${requiredPermission.code} with ${requiredPermission.minAccessLevel} access`,
      );
    }

    return true;
  }

  /**
   * Get user permissions from cache or database
   */
  private async getUserPermissions(
    userId: string,
    organizationId: string,
  ): Promise<CachedPermission[]> {
    const cacheKey = `${PERMISSION_CACHE_PREFIX}${userId}:${organizationId}`;

    // Try cache first
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached) as CachedPermission[];
    }

    // Fetch from database
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

    // Aggregate permissions across all roles (take highest access level)
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

    // Cache the result
    await this.redis.setex(
      cacheKey,
      PERMISSION_CACHE_TTL,
      JSON.stringify(permissions),
    );

    return permissions;
  }

  /**
   * Check if user has the required permission with sufficient access level
   */
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

/**
 * Service for managing permission cache
 * Inject this where you need to invalidate cache
 */
@Injectable()
export class PermissionCacheService {
  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  /**
   * Invalidate permission cache for a specific user
   */
  async invalidateUserCache(
    userId: string,
    organizationId: string,
  ): Promise<void> {
    const cacheKey = `${PERMISSION_CACHE_PREFIX}${userId}:${organizationId}`;
    await this.redis.del(cacheKey);
  }

  /**
   * Invalidate permission cache for all users in an organization
   * Call this when a role is updated/deleted
   */
  async invalidateOrganizationCache(organizationId: string): Promise<void> {
    const pattern = `${PERMISSION_CACHE_PREFIX}*:${organizationId}`;
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}
