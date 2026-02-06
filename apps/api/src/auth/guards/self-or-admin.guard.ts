import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { AuthenticatedRequest } from './auth.guard';

export const ALLOW_SELF_KEY = 'allowSelf';

/**
 * Guard that ensures employees can only access their own data,
 * while ORG_ADMINs can access any employee in their organization.
 *
 * Use with @AllowSelf() decorator on routes where employees should
 * only be able to access their own resource.
 *
 * The guard checks the :id param against the current user's ID.
 */
@Injectable()
export class SelfOrAdminGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const allowSelf = this.reflector.getAllAndOverride<boolean>(
      ALLOW_SELF_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If @AllowSelf() is not set, skip this guard
    if (!allowSelf) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;
    const targetId = request.params.id;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // SUPER_ADMIN can access anything
    if (user.role === 'SUPER_ADMIN') {
      return true;
    }

    // ORG_ADMIN can access any employee in their organization
    // (organization check is done separately by OrganizationMemberGuard)
    if (user.role === 'ORG_ADMIN') {
      return true;
    }

    // EMPLOYEE can only access their own data
    if (user.role === 'EMPLOYEE') {
      if (user.id !== targetId) {
        throw new ForbiddenException(
          'You can only access your own information',
        );
      }
      return true;
    }

    throw new ForbiddenException('Access denied');
  }
}
