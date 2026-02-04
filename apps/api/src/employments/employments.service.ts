import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import type {
  EmploymentListResponse,
  EmploymentDetailResponse,
  CreateEmploymentRequest,
  UpdateEmploymentRequest,
} from '@repo/contracts';

@Injectable()
export class EmploymentsService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly includeRelations = {
    user: {
      select: { id: true, name: true, email: true },
    },
    jobTitle: {
      select: { id: true, title: true },
    },
    department: {
      select: { id: true, name: true },
    },
    lineManager: {
      select: { id: true, name: true },
    },
  };

  /**
   * Get all employments for an organization
   */
  async findAll(organizationId: string): Promise<EmploymentListResponse> {
    const employments = await this.prisma.employment.findMany({
      where: {
        user: { organizationId },
      },
      orderBy: { effectiveDate: 'desc' },
      include: this.includeRelations,
    });

    return {
      employments,
      total: employments.length,
    };
  }

  /**
   * Get employments for a specific user
   */
  async findByUser(userId: string): Promise<EmploymentListResponse> {
    const employments = await this.prisma.employment.findMany({
      where: { userId },
      orderBy: { effectiveDate: 'desc' },
      include: this.includeRelations,
    });

    return {
      employments,
      total: employments.length,
    };
  }

  /**
   * Get a single employment by ID
   */
  async findOne(id: string): Promise<EmploymentDetailResponse> {
    const employment = await this.prisma.employment.findUnique({
      where: { id },
      include: this.includeRelations,
    });

    if (!employment) {
      throw new NotFoundException(`Employment record with ID ${id} not found`);
    }

    return employment;
  }

  /**
   * Create a new employment record
   */
  async create(
    data: CreateEmploymentRequest,
  ): Promise<EmploymentDetailResponse> {
    // Deactivate previous employments for this user
    await this.prisma.employment.updateMany({
      where: { userId: data.userId, isActive: true },
      data: { isActive: false, endDate: data.effectiveDate },
    });

    const employment = await this.prisma.employment.create({
      data: {
        ...data,
        isActive: true,
      },
      include: this.includeRelations,
    });

    return employment;
  }

  /**
   * Update an employment record
   */
  async update(
    id: string,
    data: UpdateEmploymentRequest,
  ): Promise<EmploymentDetailResponse> {
    const existing = await this.prisma.employment.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Employment record with ID ${id} not found`);
    }

    const employment = await this.prisma.employment.update({
      where: { id },
      data,
      include: this.includeRelations,
    });

    return employment;
  }

  /**
   * Terminate an employment
   */
  async terminate(
    id: string,
    endDate: Date,
  ): Promise<EmploymentDetailResponse> {
    return this.update(id, {
      isActive: false,
      endDate,
    });
  }
}
