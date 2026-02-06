import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
  calculatePaginationMeta,
  type EmployeeListResponse,
  type EmployeeDetailResponse,
  type EmployeeStatus,
  type AccountStatus,
} from '@repo/contracts';

interface FindAllOptions {
  organizationId: string;
  page?: number;
  limit?: number;
  search?: string;
  branchId?: string;
  jobTitleId?: string;
  status?: string;
}

@Injectable()
export class EmployeesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Derive account status from user confirmation state
   */
  private getAccountStatus(isConfirmed: boolean): AccountStatus {
    return isConfirmed ? 'ACTIVATED' : 'NEED_INVITATION';
  }

  /**
   * Get all employees for an organization with pagination and filters
   */
  async findAll(options: FindAllOptions): Promise<EmployeeListResponse> {
    const {
      organizationId,
      page = 1,
      limit = 10,
      search,
      branchId,
      jobTitleId,
      status,
    } = options;

    const skip = (page - 1) * limit;

    // Build where clause for filtering
    const where: any = {
      organizationId,
      role: 'EMPLOYEE', // Only fetch employees, not admins
    };

    // Search by name or email
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filter by employee status
    if (status) {
      where.employeeStatus = status;
    }

    // Filter by branch (via active employment)
    if (branchId) {
      where.employments = {
        some: {
          isActive: true,
          department: {
            branchId,
          },
        },
      };
    }

    // Filter by job title (via active employment)
    if (jobTitleId) {
      where.employments = {
        ...where.employments,
        some: {
          ...(where.employments?.some || {}),
          isActive: true,
          jobTitleId,
        },
      };
    }

    // Fetch employees with related data
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          email: true,
          isConfirmed: true,
          employeeStatus: true,
          profile: {
            select: {
              profilePictureUrl: true,
            },
          },
          employments: {
            where: { isActive: true },
            take: 1,
            select: {
              employeeId: true,
              jobTitle: {
                select: {
                  id: true,
                  title: true,
                },
              },
              lineManager: {
                select: {
                  id: true,
                  name: true,
                  profile: {
                    select: {
                      profilePictureUrl: true,
                    },
                  },
                },
              },
              department: {
                select: {
                  id: true,
                  name: true,
                  branch: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    // Transform to response format
    const employees = users.map((user) => {
      const activeEmployment = user.employments[0];

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        profilePictureUrl: user.profile?.profilePictureUrl ?? null,
        employeeId: activeEmployment?.employeeId ?? null,
        jobTitle: activeEmployment?.jobTitle ?? null,
        lineManager: activeEmployment?.lineManager
          ? {
              id: activeEmployment.lineManager.id,
              name: activeEmployment.lineManager.name,
              profilePictureUrl:
                activeEmployment.lineManager.profile?.profilePictureUrl ?? null,
            }
          : null,
        department: activeEmployment?.department
          ? {
              id: activeEmployment.department.id,
              name: activeEmployment.department.name,
            }
          : null,
        branch: activeEmployment?.department?.branch
          ? {
              id: activeEmployment.department.branch.id,
              name: activeEmployment.department.branch.name,
            }
          : null,
        employeeStatus: (user.employeeStatus ??
          'ON_BOARDING') as EmployeeStatus,
        accountStatus: this.getAccountStatus(user.isConfirmed),
      };
    });

    const meta = calculatePaginationMeta({ page, limit, total });

    return { employees, meta };
  }

  /**
   * Get a single employee by ID with full details
   */
  async findOne(
    id: string,
    organizationId: string,
  ): Promise<EmployeeDetailResponse> {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
        organizationId,
        role: 'EMPLOYEE',
      },
      select: {
        id: true,
        name: true,
        email: true,
        isConfirmed: true,
        employeeStatus: true,
        createdAt: true,
        updatedAt: true,
        profile: {
          select: {
            dateOfBirth: true,
            gender: true,
            phoneNumber: true,
            nationality: true,
            maritalStatus: true,
            profilePictureUrl: true,
            timezone: true,
            insuranceProvider: true,
            personalTaxId: true,
            socialInsuranceNumber: true,
            street1: true,
            street2: true,
            city: true,
            state: true,
            postalCode: true,
            country: true,
            emergencyContactName: true,
            emergencyContactPhone: true,
            emergencyContactRelation: true,
          },
        },
        employments: {
          where: { isActive: true },
          take: 1,
          select: {
            employeeId: true,
            employmentType: true,
            effectiveDate: true,
            endDate: true,
            jobTitle: {
              select: {
                id: true,
                title: true,
              },
            },
            lineManager: {
              select: {
                id: true,
                name: true,
                email: true,
                profile: {
                  select: {
                    profilePictureUrl: true,
                  },
                },
              },
            },
            department: {
              select: {
                id: true,
                name: true,
                branch: {
                  select: {
                    id: true,
                    name: true,
                    city: true,
                    country: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    const activeEmployment = user.employments[0];

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      employeeStatus: (user.employeeStatus ?? 'ON_BOARDING') as EmployeeStatus,
      accountStatus: this.getAccountStatus(user.isConfirmed),
      isConfirmed: user.isConfirmed,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      profile: user.profile
        ? {
            dateOfBirth: user.profile.dateOfBirth,
            gender: user.profile.gender as any,
            phoneNumber: user.profile.phoneNumber,
            nationality: user.profile.nationality,
            maritalStatus: user.profile.maritalStatus as any,
            profilePictureUrl: user.profile.profilePictureUrl,
            timezone: user.profile.timezone,
            insuranceProvider: user.profile.insuranceProvider,
            personalTaxId: user.profile.personalTaxId,
            socialInsuranceNumber: user.profile.socialInsuranceNumber,
            street1: user.profile.street1,
            street2: user.profile.street2,
            city: user.profile.city,
            state: user.profile.state,
            postalCode: user.profile.postalCode,
            country: user.profile.country,
            emergencyContactName: user.profile.emergencyContactName,
            emergencyContactPhone: user.profile.emergencyContactPhone,
            emergencyContactRelation: user.profile.emergencyContactRelation,
          }
        : null,
      employment: activeEmployment
        ? {
            employeeId: activeEmployment.employeeId,
            jobTitle: activeEmployment.jobTitle,
            department: activeEmployment.department
              ? {
                  id: activeEmployment.department.id,
                  name: activeEmployment.department.name,
                }
              : null,
            branch: activeEmployment.department?.branch
              ? {
                  id: activeEmployment.department.branch.id,
                  name: activeEmployment.department.branch.name,
                  city: activeEmployment.department.branch.city,
                  country: activeEmployment.department.branch.country,
                }
              : null,
            lineManager: activeEmployment.lineManager
              ? {
                  id: activeEmployment.lineManager.id,
                  name: activeEmployment.lineManager.name,
                  email: activeEmployment.lineManager.email,
                  profilePictureUrl:
                    activeEmployment.lineManager.profile?.profilePictureUrl ??
                    null,
                }
              : null,
            employmentType: activeEmployment.employmentType,
            effectiveDate: activeEmployment.effectiveDate,
            endDate: activeEmployment.endDate,
          }
        : null,
    };
  }
}
