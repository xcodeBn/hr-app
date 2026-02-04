import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { AuthenticatedRequest } from './auth.guard';

@Injectable()
export class OrganizationAccessGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;
    const organizationId = request.params.id;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // SUPER_ADMIN can access any organization
    // also i might change this, i think orgs should have some privacy from superadmins
    if (user.role === 'SUPER_ADMIN') {
      return true;
    }

    // ORG_ADMIN and EMPLOYEE can only access their own organization
    if (user.organizationId !== organizationId && user.role == 'ORG_ADMIN') {
      throw new ForbiddenException('User not authenticated');
    }

    return true;
  }
}
