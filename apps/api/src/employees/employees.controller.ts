import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { Roles, CurrentUser, AllowSelf } from '../auth/decorators';
import { SelfOrAdminGuard } from '../auth/guards/self-or-admin.guard';
import { EmployeeOrganizationGuard } from '../auth/guards/employee-organization.guard';
import type { User, EmployeeStatus } from '@repo/db';
import type {
  EmployeeListResponse,
  EmployeeDetailResponse,
} from '@repo/contracts';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  /**
   * Get all employees for the current user's organization
   * - ORG_ADMIN: Can see all employees in their organization
   * - EMPLOYEE: Can only see themselves (returns filtered list)
   */
  @Get()
  @Roles('ORG_ADMIN', 'EMPLOYEE')
  async findAll(
    @CurrentUser() user: User,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('branchId') branchId?: string,
    @Query('jobTitleId') jobTitleId?: string,
    @Query('status') status?: EmployeeStatus,
  ): Promise<EmployeeListResponse> {
    if (!user.organizationId) {
      throw new ForbiddenException(
        'User is not associated with an organization',
      );
    }

    // EMPLOYEE can only see themselves
    if (user.role === 'EMPLOYEE') {
      const employee = await this.employeesService.findOne(
        user.id,
        user.organizationId,
      );
      return {
        employees: [
          {
            id: employee.id,
            name: employee.name,
            email: employee.email,
            profilePictureUrl: employee.profile?.profilePictureUrl ?? null,
            employeeId: employee.employment?.employeeId ?? null,
            jobTitle: employee.employment?.jobTitle ?? null,
            lineManager: employee.employment?.lineManager
              ? {
                  id: employee.employment.lineManager.id,
                  name: employee.employment.lineManager.name,
                  profilePictureUrl:
                    employee.employment.lineManager.profilePictureUrl,
                }
              : null,
            department: employee.employment?.department ?? null,
            branch: employee.employment?.branch ?? null,
            employeeStatus: employee.employeeStatus,
            accountStatus: employee.accountStatus,
          },
        ],
        meta: {
          page: 1,
          limit: 1,
          total: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
    }

    // ORG_ADMIN can see all employees
    return this.employeesService.findAll({
      organizationId: user.organizationId,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      search,
      branchId,
      jobTitleId,
      status,
    });
  }

  /**
   * Get a single employee by ID
   * - ORG_ADMIN: Can view any employee in their organization
   * - EMPLOYEE: Can only view their own profile
   *
   * Guards:
   * - EmployeeOrganizationGuard: Ensures target employee is in same org
   * - SelfOrAdminGuard: Ensures employees can only access themselves
   */
  @Get(':id')
  @Roles('ORG_ADMIN', 'EMPLOYEE')
  @UseGuards(EmployeeOrganizationGuard, SelfOrAdminGuard)
  @AllowSelf()
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<EmployeeDetailResponse> {
    if (!user.organizationId) {
      throw new ForbiddenException(
        'User is not associated with an organization',
      );
    }

    return this.employeesService.findOne(id, user.organizationId);
  }
}
