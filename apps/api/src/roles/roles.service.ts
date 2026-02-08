import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { PermissionsService } from '../permissions/permissions.service';
import type {
  CreateOrgRoleRequest,
  UpdateOrgRoleRequest,
  OrgRoleDetailResponse,
  OrgRoleListResponse,
  PermissionCode,
  PermissionAccess,
} from '@repo/contracts';

/**
 * Default roles created for each organization with their permissions
 */
const DEFAULT_ROLES: Array<{
  name: string;
  description: string;
  isDefault: boolean;
  isSystemRole: boolean;
  permissions: Array<{ code: PermissionCode; accessLevel: PermissionAccess }>;
}> = [
  {
    name: 'Admin',
    description:
      'Admin can see all fields, edit all fields, and do everything the system offers',
    isDefault: false,
    isSystemRole: true,
    permissions: [
      // Full access to everything
      { code: 'profile:picture', accessLevel: 'VIEW_EDIT' },
      { code: 'profile:personal_info', accessLevel: 'VIEW_EDIT' },
      { code: 'profile:address', accessLevel: 'VIEW_EDIT' },
      { code: 'profile:emergency_contact', accessLevel: 'VIEW_EDIT' },
      { code: 'employment:job_info', accessLevel: 'VIEW_EDIT' },
      { code: 'employment:contract', accessLevel: 'VIEW_EDIT' },
      { code: 'employment:bank_info', accessLevel: 'VIEW_EDIT' },
      { code: 'employment:offboarding', accessLevel: 'VIEW_EDIT' },
      { code: 'attendance:view', accessLevel: 'VIEW_EDIT' },
      { code: 'attendance:manage', accessLevel: 'VIEW_EDIT' },
      { code: 'attendance:approve', accessLevel: 'VIEW_EDIT' },
      { code: 'documents:view', accessLevel: 'VIEW_EDIT' },
      { code: 'documents:upload', accessLevel: 'VIEW_EDIT' },
      { code: 'documents:delete', accessLevel: 'VIEW_EDIT' },
      { code: 'time_off:view', accessLevel: 'VIEW_EDIT' },
      { code: 'time_off:request', accessLevel: 'VIEW_EDIT' },
      { code: 'time_off:approve', accessLevel: 'VIEW_EDIT' },
      { code: 'employees:view', accessLevel: 'VIEW_EDIT' },
      { code: 'employees:create', accessLevel: 'VIEW_EDIT' },
      { code: 'employees:edit', accessLevel: 'VIEW_EDIT' },
      { code: 'employees:delete', accessLevel: 'VIEW_EDIT' },
      { code: 'employees:invite', accessLevel: 'VIEW_EDIT' },
      { code: 'departments:view', accessLevel: 'VIEW_EDIT' },
      { code: 'departments:manage', accessLevel: 'VIEW_EDIT' },
      { code: 'branches:view', accessLevel: 'VIEW_EDIT' },
      { code: 'branches:manage', accessLevel: 'VIEW_EDIT' },
      { code: 'reports:view', accessLevel: 'VIEW_EDIT' },
      { code: 'reports:export', accessLevel: 'VIEW_EDIT' },
      { code: 'settings:view', accessLevel: 'VIEW_EDIT' },
      { code: 'settings:manage', accessLevel: 'VIEW_EDIT' },
      { code: 'roles:view', accessLevel: 'VIEW_EDIT' },
      { code: 'roles:manage', accessLevel: 'VIEW_EDIT' },
    ],
  },
  {
    name: 'Human Resource',
    description: 'Manage all employee information and HR operations',
    isDefault: false,
    isSystemRole: true,
    permissions: [
      { code: 'profile:picture', accessLevel: 'VIEW_EDIT' },
      { code: 'profile:personal_info', accessLevel: 'VIEW_EDIT' },
      { code: 'profile:address', accessLevel: 'VIEW_EDIT' },
      { code: 'profile:emergency_contact', accessLevel: 'VIEW_EDIT' },
      { code: 'employment:job_info', accessLevel: 'VIEW_EDIT' },
      { code: 'employment:contract', accessLevel: 'VIEW_EDIT' },
      { code: 'employment:bank_info', accessLevel: 'VIEW_EDIT' },
      { code: 'employment:offboarding', accessLevel: 'VIEW_EDIT' },
      { code: 'attendance:view', accessLevel: 'VIEW_EDIT' },
      { code: 'attendance:manage', accessLevel: 'VIEW_EDIT' },
      { code: 'attendance:approve', accessLevel: 'VIEW_EDIT' },
      { code: 'documents:view', accessLevel: 'VIEW_EDIT' },
      { code: 'documents:upload', accessLevel: 'VIEW_EDIT' },
      { code: 'documents:delete', accessLevel: 'VIEW_EDIT' },
      { code: 'time_off:view', accessLevel: 'VIEW_EDIT' },
      { code: 'time_off:approve', accessLevel: 'VIEW_EDIT' },
      { code: 'employees:view', accessLevel: 'VIEW_EDIT' },
      { code: 'employees:create', accessLevel: 'VIEW_EDIT' },
      { code: 'employees:edit', accessLevel: 'VIEW_EDIT' },
      { code: 'employees:invite', accessLevel: 'VIEW_EDIT' },
      { code: 'departments:view', accessLevel: 'VIEW_ONLY' },
      { code: 'branches:view', accessLevel: 'VIEW_ONLY' },
      { code: 'reports:view', accessLevel: 'VIEW_EDIT' },
      { code: 'reports:export', accessLevel: 'VIEW_EDIT' },
      { code: 'roles:view', accessLevel: 'VIEW_ONLY' },
    ],
  },
  {
    name: 'Lead',
    description: 'Lead role with team management capabilities',
    isDefault: false,
    isSystemRole: true,
    permissions: [
      { code: 'profile:picture', accessLevel: 'VIEW_ONLY' },
      { code: 'profile:personal_info', accessLevel: 'VIEW_ONLY' },
      { code: 'attendance:view', accessLevel: 'VIEW_EDIT' },
      { code: 'attendance:approve', accessLevel: 'VIEW_EDIT' },
      { code: 'time_off:view', accessLevel: 'VIEW_EDIT' },
      { code: 'time_off:request', accessLevel: 'VIEW_EDIT' },
      { code: 'time_off:approve', accessLevel: 'VIEW_EDIT' },
      { code: 'employees:view', accessLevel: 'VIEW_ONLY' },
      { code: 'departments:view', accessLevel: 'VIEW_ONLY' },
      { code: 'reports:view', accessLevel: 'VIEW_ONLY' },
    ],
  },
  {
    name: 'Employee',
    description: 'Self-manage their information',
    isDefault: true, // Default role for new employees
    isSystemRole: true,
    permissions: [
      { code: 'profile:picture', accessLevel: 'VIEW_EDIT' },
      { code: 'profile:personal_info', accessLevel: 'VIEW_EDIT' },
      { code: 'profile:address', accessLevel: 'VIEW_EDIT' },
      { code: 'profile:emergency_contact', accessLevel: 'VIEW_EDIT' },
      { code: 'employment:job_info', accessLevel: 'VIEW_ONLY' },
      { code: 'employment:bank_info', accessLevel: 'VIEW_EDIT' },
      { code: 'attendance:view', accessLevel: 'VIEW_ONLY' },
      { code: 'documents:view', accessLevel: 'VIEW_ONLY' },
      { code: 'documents:upload', accessLevel: 'VIEW_EDIT' },
      { code: 'time_off:view', accessLevel: 'VIEW_ONLY' },
      { code: 'time_off:request', accessLevel: 'VIEW_EDIT' },
    ],
  },
];

@Injectable()
export class RolesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly permissionsService: PermissionsService,
  ) {}

  /**
   * Create default roles for a new organization
   * Called when an organization is approved/activated
   */
  async createDefaultRolesForOrganization(
    organizationId: string,
  ): Promise<void> {
    const permissions = await this.permissionsService.getAllPermissions();
    const permissionMap = new Map(permissions.map((p) => [p.code, p.id]));

    for (const roleDef of DEFAULT_ROLES) {
      const role = await this.prisma.orgRole.create({
        data: {
          organizationId,
          name: roleDef.name,
          description: roleDef.description,
          isDefault: roleDef.isDefault,
          isSystemRole: roleDef.isSystemRole,
        },
      });

      // Create role permissions
      const rolePermissions = roleDef.permissions
        .filter((p) => permissionMap.has(p.code))
        .map((p) => ({
          roleId: role.id,
          permissionId: permissionMap.get(p.code)!,
          accessLevel: p.accessLevel,
        }));

      if (rolePermissions.length > 0) {
        await this.prisma.rolePermission.createMany({
          data: rolePermissions,
        });
      }
    }
  }

  /**
   * List all roles for an organization
   */
  async listRoles(organizationId: string): Promise<OrgRoleListResponse> {
    const roles = await this.prisma.orgRole.findMany({
      where: { organizationId },
      include: {
        _count: {
          select: { userOrgRoles: true },
        },
      },
      orderBy: [{ isSystemRole: 'desc' }, { name: 'asc' }],
    });

    return {
      roles: roles.map((role) => ({
        id: role.id,
        name: role.name,
        description: role.description,
        isDefault: role.isDefault,
        isSystemRole: role.isSystemRole,
        memberCount: role._count.userOrgRoles,
        createdAt: role.createdAt,
      })),
      total: roles.length,
    };
  }

  /**
   * Get a single role with all permissions
   */
  async getRole(
    roleId: string,
    organizationId: string,
  ): Promise<OrgRoleDetailResponse> {
    const role = await this.prisma.orgRole.findFirst({
      where: { id: roleId, organizationId },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
        _count: {
          select: { userOrgRoles: true },
        },
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return {
      id: role.id,
      organizationId: role.organizationId,
      name: role.name,
      description: role.description,
      isDefault: role.isDefault,
      isSystemRole: role.isSystemRole,
      memberCount: role._count.userOrgRoles,
      permissions: role.rolePermissions.map((rp) => ({
        id: rp.permission.id,
        code: rp.permission.code as PermissionCode,
        section: rp.permission.section,
        name: rp.permission.name,
        description: rp.permission.description,
        accessLevel: rp.accessLevel as PermissionAccess,
      })),
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };
  }

  /**
   * Create a new custom role
   */
  async createRole(
    organizationId: string,
    data: CreateOrgRoleRequest,
  ): Promise<OrgRoleDetailResponse> {
    // Check if role name already exists in this org
    const existing = await this.prisma.orgRole.findUnique({
      where: {
        organizationId_name: { organizationId, name: data.name },
      },
    });

    if (existing) {
      throw new BadRequestException(`Role "${data.name}" already exists`);
    }

    // If this is being set as default, unset other defaults
    if (data.isDefault) {
      await this.prisma.orgRole.updateMany({
        where: { organizationId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const permissions = await this.permissionsService.getAllPermissions();
    const permissionMap = new Map(permissions.map((p) => [p.code, p.id]));

    const role = await this.prisma.orgRole.create({
      data: {
        organizationId,
        name: data.name,
        description: data.description,
        isDefault: data.isDefault ?? false,
        isSystemRole: false, // Custom roles are never system roles
      },
    });

    // Create role permissions
    if (data.permissions && data.permissions.length > 0) {
      const rolePermissions = data.permissions
        .filter((p) => permissionMap.has(p.permissionCode))
        .map((p) => ({
          roleId: role.id,
          permissionId: permissionMap.get(p.permissionCode)!,
          accessLevel: p.accessLevel,
        }));

      if (rolePermissions.length > 0) {
        await this.prisma.rolePermission.createMany({
          data: rolePermissions,
        });
      }
    }

    return this.getRole(role.id, organizationId);
  }

  /**
   * Update an existing role
   */
  async updateRole(
    roleId: string,
    organizationId: string,
    data: UpdateOrgRoleRequest,
  ): Promise<OrgRoleDetailResponse> {
    const role = await this.prisma.orgRole.findFirst({
      where: { id: roleId, organizationId },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Check name uniqueness if changing name
    if (data.name && data.name !== role.name) {
      const existing = await this.prisma.orgRole.findUnique({
        where: {
          organizationId_name: { organizationId, name: data.name },
        },
      });

      if (existing) {
        throw new BadRequestException(`Role "${data.name}" already exists`);
      }
    }

    // If setting as default, unset other defaults
    if (data.isDefault) {
      await this.prisma.orgRole.updateMany({
        where: { organizationId, isDefault: true, id: { not: roleId } },
        data: { isDefault: false },
      });
    }

    // Update role basic info
    await this.prisma.orgRole.update({
      where: { id: roleId },
      data: {
        name: data.name,
        description: data.description,
        isDefault: data.isDefault,
      },
    });

    // Update permissions if provided
    if (data.permissions !== undefined) {
      const permissions = await this.permissionsService.getAllPermissions();
      const permissionMap = new Map(permissions.map((p) => [p.code, p.id]));

      // Delete existing permissions
      await this.prisma.rolePermission.deleteMany({
        where: { roleId },
      });

      // Create new permissions
      const rolePermissions = data.permissions
        .filter((p) => permissionMap.has(p.permissionCode))
        .map((p) => ({
          roleId,
          permissionId: permissionMap.get(p.permissionCode)!,
          accessLevel: p.accessLevel,
        }));

      if (rolePermissions.length > 0) {
        await this.prisma.rolePermission.createMany({
          data: rolePermissions,
        });
      }
    }

    return this.getRole(roleId, organizationId);
  }

  /**
   * Delete a role (only non-system roles can be deleted)
   */
  async deleteRole(roleId: string, organizationId: string): Promise<void> {
    const role = await this.prisma.orgRole.findFirst({
      where: { id: roleId, organizationId },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (role.isSystemRole) {
      throw new ForbiddenException('System roles cannot be deleted');
    }

    await this.prisma.orgRole.delete({
      where: { id: roleId },
    });
  }

  /**
   * Assign a role to a user
   */
  async assignRoleToUser(
    userId: string,
    roleId: string,
    organizationId: string,
    assignedById?: string,
  ): Promise<void> {
    // Verify role belongs to organization
    const role = await this.prisma.orgRole.findFirst({
      where: { id: roleId, organizationId },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Verify user belongs to organization
    const user = await this.prisma.user.findFirst({
      where: { id: userId, organizationId },
    });

    if (!user) {
      throw new NotFoundException('User not found in this organization');
    }

    // Upsert the assignment
    await this.prisma.userOrgRole.upsert({
      where: {
        userId_roleId: { userId, roleId },
      },
      create: {
        userId,
        roleId,
        assignedBy: assignedById,
      },
      update: {
        assignedBy: assignedById,
        assignedAt: new Date(),
      },
    });
  }

  /**
   * Remove a role from a user
   */
  async removeRoleFromUser(userId: string, roleId: string): Promise<void> {
    await this.prisma.userOrgRole.deleteMany({
      where: { userId, roleId },
    });
  }

  /**
   * Get all roles assigned to a user
   */
  async getUserRoles(userId: string, organizationId: string) {
    return this.prisma.userOrgRole.findMany({
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
  }

  /**
   * Get the default role for an organization
   */
  async getDefaultRole(organizationId: string) {
    return this.prisma.orgRole.findFirst({
      where: { organizationId, isDefault: true },
    });
  }
}
