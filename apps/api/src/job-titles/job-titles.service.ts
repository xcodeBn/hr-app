import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import type {
  JobTitleListResponse,
  JobTitle,
  CreateJobTitleRequest,
  UpdateJobTitleRequest,
} from '@repo/contracts';

@Injectable()
export class JobTitlesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all job titles (global, not org-specific)
   */
  async findAll(): Promise<JobTitleListResponse> {
    const jobTitles = await this.prisma.jobTitles.findMany({
      orderBy: { title: 'asc' },
      include: {
        _count: {
          select: { employments: true },
        },
      },
    });

    return {
      jobTitles,
      total: jobTitles.length,
    };
  }

  /**
   * Get a single job title by ID
   */
  async findOne(id: string): Promise<JobTitle> {
    const jobTitle = await this.prisma.jobTitles.findUnique({
      where: { id },
    });

    if (!jobTitle) {
      throw new NotFoundException(`Job title with ID ${id} not found`);
    }

    return jobTitle;
  }

  /**
   * Create a new job title
   */
  async create(data: CreateJobTitleRequest): Promise<JobTitle> {
    const existing = await this.prisma.jobTitles.findUnique({
      where: { title: data.title },
    });

    if (existing) {
      throw new ConflictException(`Job title "${data.title}" already exists`);
    }

    return this.prisma.jobTitles.create({ data });
  }

  /**
   * Update a job title
   */
  async update(id: string, data: UpdateJobTitleRequest): Promise<JobTitle> {
    const existing = await this.prisma.jobTitles.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Job title with ID ${id} not found`);
    }

    // Check if new title already exists
    if (data.title && data.title !== existing.title) {
      const duplicate = await this.prisma.jobTitles.findUnique({
        where: { title: data.title },
      });
      if (duplicate) {
        throw new ConflictException(`Job title "${data.title}" already exists`);
      }
    }

    return this.prisma.jobTitles.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a job title
   */
  async delete(id: string): Promise<void> {
    const existing = await this.prisma.jobTitles.findUnique({
      where: { id },
      include: { _count: { select: { employments: true } } },
    });

    if (!existing) {
      throw new NotFoundException(`Job title with ID ${id} not found`);
    }

    if (existing._count.employments > 0) {
      throw new ConflictException(
        `Cannot delete job title with ${existing._count.employments} active employments`,
      );
    }

    await this.prisma.jobTitles.delete({ where: { id } });
  }
}
