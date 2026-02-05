import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { BranchesService } from './branches.service';
import { PrismaService } from '../database/prisma.service';
import type { CreateBranchRequest, UpdateBranchRequest } from '@repo/contracts';

describe('BranchesService', () => {
  let service: BranchesService;

  const mockOrganizationId = '123e4567-e89b-12d3-a456-426614174000';
  const mockBranchId = '123e4567-e89b-12d3-a456-426614174001';

  const mockBranch = {
    id: mockBranchId,
    organizationId: mockOrganizationId,
    name: 'Main Branch',
    street1: '123 Main St',
    street2: null,
    city: 'New York',
    state: 'NY',
    postalCode: '10001',
    country: 'USA',
    phoneNumber: '+1234567890',
    email: 'branch@example.com',
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: {
      departments: 3,
    },
  };

  const prismaServiceMock = {
    branch: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BranchesService,
        { provide: PrismaService, useValue: prismaServiceMock },
      ],
    }).compile();

    service = module.get<BranchesService>(BranchesService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all branches for an organization', async () => {
      const mockBranches = [mockBranch];
      prismaServiceMock.branch.findMany.mockResolvedValue(mockBranches);

      const result = await service.findAll(mockOrganizationId);

      expect(prismaServiceMock.branch.findMany).toHaveBeenCalledWith({
        where: { organizationId: mockOrganizationId },
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { departments: true },
          },
        },
      });
      expect(result).toEqual({
        branches: mockBranches,
        total: 1,
      });
    });

    it('should return empty array when no branches exist', async () => {
      prismaServiceMock.branch.findMany.mockResolvedValue([]);

      const result = await service.findAll(mockOrganizationId);

      expect(result).toEqual({
        branches: [],
        total: 0,
      });
    });
  });

  describe('findOne', () => {
    it('should return a branch by id', async () => {
      prismaServiceMock.branch.findFirst.mockResolvedValue(mockBranch);

      const result = await service.findOne(mockOrganizationId, mockBranchId);

      expect(prismaServiceMock.branch.findFirst).toHaveBeenCalledWith({
        where: { id: mockBranchId, organizationId: mockOrganizationId },
        include: {
          _count: {
            select: { departments: true },
          },
        },
      });
      expect(result).toEqual(mockBranch);
    });

    it('should throw NotFoundException when branch does not exist', async () => {
      prismaServiceMock.branch.findFirst.mockResolvedValue(null);

      await expect(
        service.findOne(mockOrganizationId, mockBranchId),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.findOne(mockOrganizationId, mockBranchId),
      ).rejects.toThrow(`Branch with ID ${mockBranchId} not found`);
    });
  });

  describe('create', () => {
    it('should create a new branch', async () => {
      const createDto: CreateBranchRequest = {
        name: 'New Branch',
        street1: '456 New St',
        city: 'Los Angeles',
        state: 'CA',
        postalCode: '90001',
        country: 'USA',
        phoneNumber: '+9876543210',
        email: 'newbranch@example.com',
      };

      const createdBranch = {
        ...mockBranch,
        ...createDto,
        id: 'new-branch-id',
      };

      prismaServiceMock.branch.create.mockResolvedValue(createdBranch);

      const result = await service.create(mockOrganizationId, createDto);

      expect(prismaServiceMock.branch.create).toHaveBeenCalledWith({
        data: {
          ...createDto,
          organizationId: mockOrganizationId,
        },
        include: {
          _count: {
            select: { departments: true },
          },
        },
      });
      expect(result).toEqual(createdBranch);
    });

    it('should create a branch with minimal data', async () => {
      const createDto: CreateBranchRequest = {
        name: 'Minimal Branch',
        country: 'USA',
      };

      const createdBranch = {
        ...mockBranch,
        ...createDto,
        id: 'minimal-branch-id',
        street1: null,
        street2: null,
        city: null,
        state: null,
        postalCode: null,
        phoneNumber: null,
        email: null,
      };

      prismaServiceMock.branch.create.mockResolvedValue(createdBranch);

      const result = await service.create(mockOrganizationId, createDto);

      expect(prismaServiceMock.branch.create).toHaveBeenCalledWith({
        data: {
          ...createDto,
          organizationId: mockOrganizationId,
        },
        include: {
          _count: {
            select: { departments: true },
          },
        },
      });
      expect(result).toEqual(createdBranch);
    });
  });

  describe('update', () => {
    it('should update an existing branch', async () => {
      const updateDto: UpdateBranchRequest = {
        name: 'Updated Branch Name',
        city: 'San Francisco',
      };

      const updatedBranch = {
        ...mockBranch,
        ...updateDto,
      };

      prismaServiceMock.branch.findFirst.mockResolvedValue(mockBranch);
      prismaServiceMock.branch.update.mockResolvedValue(updatedBranch);

      const result = await service.update(
        mockOrganizationId,
        mockBranchId,
        updateDto,
      );

      expect(prismaServiceMock.branch.findFirst).toHaveBeenCalledWith({
        where: { id: mockBranchId, organizationId: mockOrganizationId },
      });
      expect(prismaServiceMock.branch.update).toHaveBeenCalledWith({
        where: { id: mockBranchId },
        data: updateDto,
        include: {
          _count: {
            select: { departments: true },
          },
        },
      });
      expect(result).toEqual(updatedBranch);
    });

    it('should throw NotFoundException when updating non-existent branch', async () => {
      const updateDto: UpdateBranchRequest = {
        name: 'Updated Name',
      };

      prismaServiceMock.branch.findFirst.mockResolvedValue(null);

      await expect(
        service.update(mockOrganizationId, mockBranchId, updateDto),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.update(mockOrganizationId, mockBranchId, updateDto),
      ).rejects.toThrow(`Branch with ID ${mockBranchId} not found`);
    });
  });

  describe('delete', () => {
    it('should delete an existing branch', async () => {
      prismaServiceMock.branch.findFirst.mockResolvedValue(mockBranch);
      prismaServiceMock.branch.delete.mockResolvedValue(mockBranch);

      await service.delete(mockOrganizationId, mockBranchId);

      expect(prismaServiceMock.branch.findFirst).toHaveBeenCalledWith({
        where: { id: mockBranchId, organizationId: mockOrganizationId },
      });
      expect(prismaServiceMock.branch.delete).toHaveBeenCalledWith({
        where: { id: mockBranchId },
      });
    });

    it('should throw NotFoundException when deleting non-existent branch', async () => {
      prismaServiceMock.branch.findFirst.mockResolvedValue(null);

      await expect(
        service.delete(mockOrganizationId, mockBranchId),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.delete(mockOrganizationId, mockBranchId),
      ).rejects.toThrow(`Branch with ID ${mockBranchId} not found`);
    });
  });
});
