import { Test, TestingModule } from '@nestjs/testing';
import { BranchesController } from './branches.controller';
import { BranchesService } from './branches.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { OrganizationAdminGuard } from '../auth/guards/organaization-admin-gaurd';
import type {
  BranchListResponse,
  BranchDetailResponse,
  CreateBranchRequest,
  UpdateBranchRequest,
} from '@repo/contracts';

describe('BranchesController', () => {
  let controller: BranchesController;
  let branchesService: BranchesService;

  const mockOrganizationId = '123e4567-e89b-12d3-a456-426614174000';
  const mockBranchId = '123e4567-e89b-12d3-a456-426614174001';

  const mockBranch: BranchDetailResponse = {
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

  const mockBranchListResponse: BranchListResponse = {
    branches: [mockBranch],
    total: 1,
  };

  const branchesServiceMock = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BranchesController],
      providers: [{ provide: BranchesService, useValue: branchesServiceMock }],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(OrganizationAdminGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<BranchesController>(BranchesController);
    branchesService = module.get<BranchesService>(BranchesService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all branches for an organization', async () => {
      branchesServiceMock.findAll.mockResolvedValue(mockBranchListResponse);

      const result = await controller.findAll(mockOrganizationId);

      expect(branchesServiceMock.findAll).toHaveBeenCalledWith(
        mockOrganizationId,
      );
      expect(result).toEqual(mockBranchListResponse);
    });

    it('should return empty branches array', async () => {
      const emptyResponse: BranchListResponse = { branches: [], total: 0 };
      branchesServiceMock.findAll.mockResolvedValue(emptyResponse);

      const result = await controller.findAll(mockOrganizationId);

      expect(result).toEqual(emptyResponse);
    });
  });

  describe('findOne', () => {
    it('should return a single branch', async () => {
      branchesServiceMock.findOne.mockResolvedValue(mockBranch);

      const result = await controller.findOne(mockOrganizationId, mockBranchId);

      expect(branchesServiceMock.findOne).toHaveBeenCalledWith(
        mockOrganizationId,
        mockBranchId,
      );
      expect(result).toEqual(mockBranch);
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

      const createdBranch = { ...mockBranch, ...createDto };
      branchesServiceMock.create.mockResolvedValue(createdBranch);

      const result = await controller.create(mockOrganizationId, createDto);

      expect(branchesServiceMock.create).toHaveBeenCalledWith(
        mockOrganizationId,
        createDto,
      );
      expect(result).toEqual(createdBranch);
    });

    it('should create a branch with minimal required fields', async () => {
      const createDto: CreateBranchRequest = {
        name: 'Minimal Branch',
        country: 'USA',
      };

      const createdBranch = {
        ...mockBranch,
        ...createDto,
        street1: null,
        city: null,
        state: null,
        postalCode: null,
        phoneNumber: null,
        email: null,
      };
      branchesServiceMock.create.mockResolvedValue(createdBranch);

      const result = await controller.create(mockOrganizationId, createDto);

      expect(branchesServiceMock.create).toHaveBeenCalledWith(
        mockOrganizationId,
        createDto,
      );
      expect(result).toEqual(createdBranch);
    });
  });

  describe('update', () => {
    it('should update an existing branch', async () => {
      const updateDto: UpdateBranchRequest = {
        name: 'Updated Branch Name',
        city: 'San Francisco',
      };

      const updatedBranch = { ...mockBranch, ...updateDto };
      branchesServiceMock.update.mockResolvedValue(updatedBranch);

      const result = await controller.update(
        mockOrganizationId,
        mockBranchId,
        updateDto,
      );

      expect(branchesServiceMock.update).toHaveBeenCalledWith(
        mockOrganizationId,
        mockBranchId,
        updateDto,
      );
      expect(result).toEqual(updatedBranch);
    });

    it('should update only specific fields', async () => {
      const updateDto: UpdateBranchRequest = {
        phoneNumber: '+1111111111',
      };

      const updatedBranch = { ...mockBranch, ...updateDto };
      branchesServiceMock.update.mockResolvedValue(updatedBranch);

      const result = await controller.update(
        mockOrganizationId,
        mockBranchId,
        updateDto,
      );

      expect(branchesServiceMock.update).toHaveBeenCalledWith(
        mockOrganizationId,
        mockBranchId,
        updateDto,
      );
      expect(result).toEqual(updatedBranch);
    });
  });

  describe('delete', () => {
    it('should delete a branch', async () => {
      branchesServiceMock.delete.mockResolvedValue(undefined);

      const result = await controller.delete(mockOrganizationId, mockBranchId);

      expect(branchesServiceMock.delete).toHaveBeenCalledWith(
        mockOrganizationId,
        mockBranchId,
      );
      expect(result).toBeUndefined();
    });
  });
});
