import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import type { AuthenticatedRequest } from './auth.guard';

/**
 * Guard that ensures the requested employee (by :id param) belongs
 * to the same organization as the current user.
 *
 * This prevents cross-organization data access.
 *
 * Use on routes like GET /employees/:id
 */
@Injectable()
export class EmployeeOrganizationGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;
    const targetEmployeeId = request.params.id;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // SUPER_ADMIN can access any employee (for system administration)
    if (user.role === 'SUPER_ADMIN') {
      return true;
    }

    // User must have an organization
    if (!user.organizationId) {
      throw new ForbiddenException(
        'User is not associated with an organization',
      );
    }

    // If no target ID, this guard doesn't apply (list endpoints)
    if (!targetEmployeeId) {
      return true;
    }

    // Check if the target employee exists and belongs to the same org
    const targetEmployee = await this.prisma.user.findFirst({
      where: {
        id: targetEmployeeId,
        role: 'EMPLOYEE',
      },
      select: {
        id: true,
        organizationId: true,
      },
    });

    if (!targetEmployee) {
      throw new NotFoundException('Employee not found');
    }

    if (targetEmployee.organizationId !== user.organizationId) {
      // Don't reveal that the employee exists in another org
      throw new NotFoundException('Employee not found');
    }

    return true;
  }
}
