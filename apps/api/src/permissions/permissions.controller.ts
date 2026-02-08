import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PermissionsService } from './permissions.service';
import type { AvailablePermissionsResponse } from '@repo/contracts';

@ApiTags('permissions')
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all available permissions grouped by section' })
  @ApiOkResponse({ description: 'Permissions retrieved successfully' })
  async getAvailablePermissions(): Promise<AvailablePermissionsResponse> {
    return this.permissionsService.getAvailablePermissions();
  }
}
