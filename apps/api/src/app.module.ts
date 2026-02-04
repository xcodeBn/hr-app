import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { DatabaseModule } from './database/database.module';
import { BranchesModule } from './branches/branches.module';
import { DepartmentsModule } from './departments/departments.module';
import { JobTitlesModule } from './job-titles/job-titles.module';
import { WorkSchedulesModule } from './work-schedules/work-schedules.module';
import { AttendanceModule } from './attendance/attendance.module';
import { EmploymentsModule } from './employments/employments.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    BullModule.forRoot({
      connection: {
        url: process.env.REDIS_URL,
      },
    }),
    DatabaseModule,
    AuthModule,
    MailModule,
    OrganizationsModule,
    BranchesModule,
    DepartmentsModule,
    JobTitlesModule,
    WorkSchedulesModule,
    AttendanceModule,
    EmploymentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
