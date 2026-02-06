import { Module } from '@nestjs/common';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';
import { DatabaseModule } from '../database/database.module';
import { SelfOrAdminGuard } from '../auth/guards/self-or-admin.guard';
import { EmployeeOrganizationGuard } from '../auth/guards/employee-organization.guard';

@Module({
  imports: [DatabaseModule],
  controllers: [EmployeesController],
  providers: [EmployeesService, SelfOrAdminGuard, EmployeeOrganizationGuard],
  exports: [EmployeesService],
})
export class EmployeesModule {}
