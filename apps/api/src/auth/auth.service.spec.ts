import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bullmq';
import { AuthService } from './auth.service';
import { PrismaService } from '../database/prisma.service';
import { SessionService } from './session.service';
import { MAIL_QUEUE } from '../mail/mail.constants';

describe('AuthService', () => {
  let service: AuthService;

  const prismaServiceMock = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    magicLink: {
      updateMany: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const sessionServiceMock = {
    createSession: jest.fn(),
    deleteSession: jest.fn(),
    validateSession: jest.fn(),
  };

  const mailQueueMock = {
    add: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaServiceMock },
        { provide: SessionService, useValue: sessionServiceMock },
        { provide: getQueueToken(MAIL_QUEUE), useValue: mailQueueMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
