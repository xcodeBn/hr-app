import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import type {
  BranchListResponse,
  BranchDetailResponse,
  CreateBranchRequest,
  UpdateBranchRequest,
} from '@repo/contracts';

@Injectable()
export class BranchesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all branches for an organization
   */
  async findAll(organizationId: string): Promise<BranchListResponse> {
    const branches = await this.prisma.branch.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { departments: true },
        },
      },
    });

    return {
      branches,
      total: branches.length,
    };
  }

  /**
   * Get a single branch by ID
   */
  async findOne(
    organizationId: string,
    id: string,
  ): Promise<BranchDetailResponse> {
    const branch = await this.prisma.branch.findFirst({
      where: { id, organizationId },
      include: {
        _count: {
          select: { departments: true },
        },
      },
    });

    if (!branch) {
      throw new NotFoundException(`Branch with ID ${id} not found`);
    }

    return branch;
  }

  /**
   * Create a new branch
   */
  async create(
    organizationId: string,
    data: CreateBranchRequest,
  ): Promise<BranchDetailResponse> {
    const branch = await this.prisma.branch.create({
      data: {
        ...data,
        organizationId,
      },
      include: {
        _count: {
          select: { departments: true },
        },
      },
    });

    return branch;
  }

  /**
   * Update a branch
   */
  async update(
    organizationId: string,
    id: string,
    data: UpdateBranchRequest,
  ): Promise<BranchDetailResponse> {
    // Verify branch belongs to organization
    const existing = await this.prisma.branch.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      throw new NotFoundException(`Branch with ID ${id} not found`);
    }

    const branch = await this.prisma.branch.update({
      where: { id },
      data,
      include: {
        _count: {
          select: { departments: true },
        },
      },
    });

    return branch;
  }

  /**
   * Delete a branch
   */
  async delete(organizationId: string, id: string): Promise<void> {
    const existing = await this.prisma.branch.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      throw new NotFoundException(`Branch with ID ${id} not found`);
    }

    await this.prisma.branch.delete({ where: { id } });
  }
}
