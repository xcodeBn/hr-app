import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import type {
  DepartmentListResponse,
  DepartmentDetailResponse,
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
} from '@repo/contracts';

@Injectable()
export class DepartmentsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all departments for a branch
   */
  async findAll(branchId: string): Promise<DepartmentListResponse> {
    const departments = await this.prisma.department.findMany({
      where: { branchId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { users: true, employments: true },
        },
      },
    });

    return {
      departments,
      total: departments.length,
    };
  }

  /**
   * Get a single department by ID
   */
  async findOne(
    branchId: string,
    id: string,
  ): Promise<DepartmentDetailResponse> {
    const department = await this.prisma.department.findFirst({
      where: { id, branchId },
      include: {
        _count: {
          select: { users: true, employments: true },
        },
      },
    });

    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    return department;
  }

  /**
   * Create a new department
   */
  async create(
    branchId: string,
    data: CreateDepartmentRequest,
  ): Promise<DepartmentDetailResponse> {
    const department = await this.prisma.department.create({
      data: {
        ...data,
        branchId,
      },
      include: {
        _count: {
          select: { users: true, employments: true },
        },
      },
    });

    return department;
  }

  /**
   * Update a department
   */
  async update(
    branchId: string,
    id: string,
    data: UpdateDepartmentRequest,
  ): Promise<DepartmentDetailResponse> {
    const existing = await this.prisma.department.findFirst({
      where: { id, branchId },
    });

    if (!existing) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    const department = await this.prisma.department.update({
      where: { id },
      data,
      include: {
        _count: {
          select: { users: true, employments: true },
        },
      },
    });

    return department;
  }

  /**
   * Delete a department
   */
  async delete(branchId: string, id: string): Promise<void> {
    const existing = await this.prisma.department.findFirst({
      where: { id, branchId },
    });

    if (!existing) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    await this.prisma.department.delete({ where: { id } });
  }
}
