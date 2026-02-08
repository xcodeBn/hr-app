import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import type {
  PermissionCode,
  PermissionSection,
  AvailablePermissionsResponse,
} from '@repo/contracts';

/**
 * Permission definitions with metadata for seeding
 */
const PERMISSION_DEFINITIONS: Array<{
  code: PermissionCode;
  section: PermissionSection;
  name: string;
  description: string;
}> = [
  // Profile section
  {
    code: 'profile:picture',
    section: 'Profile',
    name: 'Profile Picture',
    description: 'View and edit profile pictures',
  },
  {
    code: 'profile:personal_info',
    section: 'Profile',
    name: 'Personal Info',
    description: 'View and edit personal information',
  },
  {
    code: 'profile:address',
    section: 'Profile',
    name: 'Address',
    description: 'View and edit address information',
  },
  {
    code: 'profile:emergency_contact',
    section: 'Profile',
    name: 'Emergency Contact',
    description: 'View and edit emergency contacts',
  },

  // Employment section
  {
    code: 'employment:job_info',
    section: 'Employment',
    name: 'Job Information',
    description: 'View and edit job details',
  },
  {
    code: 'employment:contract',
    section: 'Employment',
    name: 'Contract',
    description: 'View and edit employment contracts',
  },
  {
    code: 'employment:bank_info',
    section: 'Employment',
    name: 'Bank Info',
    description: 'View and edit bank account information',
  },
  {
    code: 'employment:offboarding',
    section: 'Employment',
    name: 'Offboarding Details',
    description: 'View and edit offboarding information',
  },

  // Attendance section
  {
    code: 'attendance:view',
    section: 'Attendance',
    name: 'View Attendance',
    description: 'View attendance records',
  },
  {
    code: 'attendance:manage',
    section: 'Attendance',
    name: 'Manage Attendance',
    description: 'Edit attendance records',
  },
  {
    code: 'attendance:approve',
    section: 'Attendance',
    name: 'Approve Attendance',
    description: 'Approve or reject attendance entries',
  },

  // Documents section
  {
    code: 'documents:view',
    section: 'Documents',
    name: 'View Documents',
    description: 'View uploaded documents',
  },
  {
    code: 'documents:upload',
    section: 'Documents',
    name: 'Upload Documents',
    description: 'Upload new documents',
  },
  {
    code: 'documents:delete',
    section: 'Documents',
    name: 'Delete Documents',
    description: 'Delete existing documents',
  },

  // Time Off section
  {
    code: 'time_off:view',
    section: 'Time Off',
    name: 'View Time Off',
    description: 'View time off requests and balances',
  },
  {
    code: 'time_off:request',
    section: 'Time Off',
    name: 'Request Time Off',
    description: 'Submit time off requests',
  },
  {
    code: 'time_off:approve',
    section: 'Time Off',
    name: 'Approve Time Off',
    description: 'Approve or reject time off requests',
  },

  // Employees section
  {
    code: 'employees:view',
    section: 'Employees',
    name: 'View Employees',
    description: 'View employee list and details',
  },
  {
    code: 'employees:create',
    section: 'Employees',
    name: 'Create Employees',
    description: 'Create new employee records',
  },
  {
    code: 'employees:edit',
    section: 'Employees',
    name: 'Edit Employees',
    description: 'Edit employee information',
  },
  {
    code: 'employees:delete',
    section: 'Employees',
    name: 'Delete Employees',
    description: 'Delete employee records',
  },
  {
    code: 'employees:invite',
    section: 'Employees',
    name: 'Invite Employees',
    description: 'Send invitations to new employees',
  },

  // Departments section
  {
    code: 'departments:view',
    section: 'Departments',
    name: 'View Departments',
    description: 'View department structure',
  },
  {
    code: 'departments:manage',
    section: 'Departments',
    name: 'Manage Departments',
    description: 'Create, edit, and delete departments',
  },

  // Branches section
  {
    code: 'branches:view',
    section: 'Branches',
    name: 'View Branches',
    description: 'View branch/office locations',
  },
  {
    code: 'branches:manage',
    section: 'Branches',
    name: 'Manage Branches',
    description: 'Create, edit, and delete branches',
  },

  // Reports section
  {
    code: 'reports:view',
    section: 'Reports',
    name: 'View Reports',
    description: 'View analytics and reports',
  },
  {
    code: 'reports:export',
    section: 'Reports',
    name: 'Export Reports',
    description: 'Export reports to files',
  },

  // Settings section
  {
    code: 'settings:view',
    section: 'Settings',
    name: 'View Settings',
    description: 'View organization settings',
  },
  {
    code: 'settings:manage',
    section: 'Settings',
    name: 'Manage Settings',
    description: 'Modify organization settings',
  },

  // Roles section
  {
    code: 'roles:view',
    section: 'Roles',
    name: 'View Roles',
    description: 'View roles and permissions',
  },
  {
    code: 'roles:manage',
    section: 'Roles',
    name: 'Manage Roles',
    description: 'Create, edit, and delete roles',
  },
];

@Injectable()
export class PermissionsService implements OnModuleInit {
  private readonly logger = new Logger(PermissionsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Seeds permissions on module initialization
   */
  async onModuleInit() {
    await this.seedPermissions();
  }

  /**
   * Upserts all permission definitions into the database
   */
  async seedPermissions(): Promise<void> {
    this.logger.log('Seeding permissions...');

    for (const permission of PERMISSION_DEFINITIONS) {
      await this.prisma.permission.upsert({
        where: { code: permission.code },
        update: {
          section: permission.section,
          name: permission.name,
          description: permission.description,
        },
        create: {
          code: permission.code,
          section: permission.section,
          name: permission.name,
          description: permission.description,
        },
      });
    }

    this.logger.log(`Seeded ${PERMISSION_DEFINITIONS.length} permissions`);
  }

  /**
   * Get all permissions grouped by section for UI display
   */
  async getAvailablePermissions(): Promise<AvailablePermissionsResponse> {
    const permissions = await this.prisma.permission.findMany({
      orderBy: [{ section: 'asc' }, { name: 'asc' }],
    });

    // Group by section
    const grouped = permissions.reduce(
      (acc, permission) => {
        const section = permission.section as PermissionSection;
        if (!acc[section]) {
          acc[section] = [];
        }
        acc[section].push({
          id: permission.id,
          code: permission.code as PermissionCode,
          name: permission.name,
          description: permission.description,
        });
        return acc;
      },
      {} as Record<
        string,
        Array<{
          id: string;
          code: PermissionCode;
          name: string;
          description: string | null;
        }>
      >,
    );

    // Convert to array format
    const groups = Object.entries(grouped).map(([section, permissions]) => ({
      section: section as PermissionSection,
      permissions,
    }));

    return { groups };
  }

  /**
   * Get all permissions as a flat list
   */
  async getAllPermissions() {
    return this.prisma.permission.findMany({
      orderBy: [{ section: 'asc' }, { name: 'asc' }],
    });
  }

  /**
   * Get a single permission by code
   */
  async getPermissionByCode(code: PermissionCode) {
    return this.prisma.permission.findUnique({
      where: { code },
    });
  }
}
