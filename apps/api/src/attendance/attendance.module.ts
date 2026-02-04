import { Module } from '@nestjs/common';
import {
  AttendanceController,
  AttendanceAdminController,
} from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [AttendanceController, AttendanceAdminController],
  providers: [AttendanceService],
  exports: [AttendanceService],
})
export class AttendanceModule {}
