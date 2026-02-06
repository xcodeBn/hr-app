import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { Roles, CurrentUser } from '../auth/decorators';
import { EmployeeOrganizationGuard } from '../auth/guards/employee-organization.guard';
import type { User, EmployeeStatus } from '@repo/db';
import type {
  EmployeeListResponse,
  EmployeeDetailResponse,
} from '@repo/contracts';

@Controller('employees')
@Roles('ORG_ADMIN')
@UseGuards(EmployeeOrganizationGuard)
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  /**
   * Get all employees for the current user's organization
   */
  @Get()
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
   */
  @Get(':id')
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
