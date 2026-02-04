import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { AuthenticatedRequest } from './auth.guard';

@Injectable()
export class OrganizationAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;
    const organizationId = request.params.id;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // SUPER_ADMIN can access any organization
    if (user.role === 'SUPER_ADMIN') {
      return true;
    }

    // Only ORG_ADMIN can access organization management endpoints
    if (user.role !== 'ORG_ADMIN') {
      throw new ForbiddenException(
        'Only organization administrators can perform this action',
      );
    }

    // ORG_ADMIN can only manage their own organization
    if (user.organizationId !== organizationId) {
      throw new ForbiddenException('You can only manage your own organization');
    }

    return true;
  }
}
