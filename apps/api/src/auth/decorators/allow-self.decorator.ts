import { SetMetadata } from '@nestjs/common';
import { ALLOW_SELF_KEY } from '../guards/self-or-admin.guard';

/**
 * Decorator to mark routes where employees can only access their own data.
 * ORG_ADMINs can still access any employee in their organization.
 *
 * Usage:
 * @Get(':id')
 * @AllowSelf()
 * async findOne(@Param('id') id: string) { ... }
 */
export const AllowSelf = () => SetMetadata(ALLOW_SELF_KEY, true);
