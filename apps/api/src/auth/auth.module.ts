import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import Redis from 'ioredis';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/roles.guard';
import {
  PermissionsGuard,
  PermissionCacheService,
} from './guards/permissions.guard';
import { PermissionsCheckService } from './permissions-check.service';
import { SessionService } from './session.service';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [MailModule],
  providers: [
    AuthService,
    SessionService,
    PermissionCacheService,
    PermissionsCheckService,
    {
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        return new Redis(process.env.REDIS_URL);
      },
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
  controllers: [AuthController],
  exports: [
    AuthService,
    SessionService,
    PermissionCacheService,
    PermissionsCheckService,
    'REDIS_CLIENT',
  ],
})
export class AuthModule {}
