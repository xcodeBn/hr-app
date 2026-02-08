import { Module, forwardRef } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { OrganizationsController } from './organizations.controller';
import { RolesModule } from '../roles/roles.module';

@Module({
  imports: [forwardRef(() => RolesModule)],
  providers: [OrganizationsService],
  controllers: [OrganizationsController],
  exports: [OrganizationsService],
})
export class OrganizationsModule {}
