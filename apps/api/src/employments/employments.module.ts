import { Module } from '@nestjs/common';
import { EmploymentsController } from './employments.controller';
import { EmploymentsService } from './employments.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [EmploymentsController],
  providers: [EmploymentsService],
  exports: [EmploymentsService],
})
export class EmploymentsModule {}
