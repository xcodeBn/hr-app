import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UsePipes,
} from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CurrentUser, RequirePermission } from '../auth/decorators';
import { ZodValidationPipe } from '../common/pipes';
import {
  createOrgRoleRequestSchema,
  updateOrgRoleRequestSchema,
  assignRoleRequestSchema,
  type CreateOrgRoleRequest,
  type UpdateOrgRoleRequest,
  type AssignRoleRequest,
  type OrgRoleListResponse,
  type OrgRoleDetailResponse,
} from '@repo/contracts';
import type { User } from '@repo/db';

@ApiTags('roles')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @RequirePermission('roles:view')
  @ApiOperation({ summary: 'List all roles in the organization' })
  @ApiOkResponse({ description: 'Roles retrieved successfully' })
  async listRoles(@CurrentUser() user: User): Promise<OrgRoleListResponse> {
    if (!user.organizationId) {
      throw new Error('User must belong to an organization');
    }
    return this.rolesService.listRoles(user.organizationId);
  }

  @Get(':id')
  @RequirePermission('roles:view')
  @ApiOperation({ summary: 'Get a single role with permissions' })
  @ApiOkResponse({ description: 'Role retrieved successfully' })
  async getRole(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<OrgRoleDetailResponse> {
    if (!user.organizationId) {
      throw new Error('User must belong to an organization');
    }
    return this.rolesService.getRole(id, user.organizationId);
  }

  @Post()
  @RequirePermission('roles:manage')
  @UsePipes(new ZodValidationPipe(createOrgRoleRequestSchema))
  @ApiOperation({ summary: 'Create a new role' })
  @ApiOkResponse({ description: 'Role created successfully' })
  async createRole(
    @Body() body: CreateOrgRoleRequest,
    @CurrentUser() user: User,
  ): Promise<OrgRoleDetailResponse> {
    if (!user.organizationId) {
      throw new Error('User must belong to an organization');
    }
    return this.rolesService.createRole(user.organizationId, body);
  }

  @Patch(':id')
  @RequirePermission('roles:manage')
  @UsePipes(new ZodValidationPipe(updateOrgRoleRequestSchema))
  @ApiOperation({ summary: 'Update an existing role' })
  @ApiOkResponse({ description: 'Role updated successfully' })
  async updateRole(
    @Param('id') id: string,
    @Body() body: UpdateOrgRoleRequest,
    @CurrentUser() user: User,
  ): Promise<OrgRoleDetailResponse> {
    if (!user.organizationId) {
      throw new Error('User must belong to an organization');
    }
    return this.rolesService.updateRole(id, user.organizationId, body);
  }

  @Delete(':id')
  @RequirePermission('roles:manage')
  @ApiOperation({ summary: 'Delete a role (non-system roles only)' })
  @ApiOkResponse({ description: 'Role deleted successfully' })
  async deleteRole(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<{ success: boolean }> {
    if (!user.organizationId) {
      throw new Error('User must belong to an organization');
    }
    await this.rolesService.deleteRole(id, user.organizationId);
    return { success: true };
  }

  @Post(':id/assign')
  @RequirePermission('roles:manage')
  @UsePipes(new ZodValidationPipe(assignRoleRequestSchema))
  @ApiOperation({ summary: 'Assign a role to a user' })
  @ApiOkResponse({ description: 'Role assigned successfully' })
  async assignRole(
    @Param('id') roleId: string,
    @Body() body: AssignRoleRequest,
    @CurrentUser() user: User,
  ): Promise<{ success: boolean }> {
    if (!user.organizationId) {
      throw new Error('User must belong to an organization');
    }
    await this.rolesService.assignRoleToUser(
      body.userId,
      roleId,
      user.organizationId,
      user.id,
    );
    return { success: true };
  }

  @Delete(':roleId/users/:userId')
  @RequirePermission('roles:manage')
  @ApiOperation({ summary: 'Remove a role from a user' })
  @ApiOkResponse({ description: 'Role removed successfully' })
  async removeRole(
    @Param('roleId') roleId: string,
    @Param('userId') userId: string,
  ): Promise<{ success: boolean }> {
    await this.rolesService.removeRoleFromUser(userId, roleId);
    return { success: true };
  }
}
