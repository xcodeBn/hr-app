import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { OrganizationAdminGuard } from '../auth/guards/organaization-admin-gaurd';
import { ZodValidationPipe } from '../common';
import {
  createDepartmentRequestSchema,
  updateDepartmentRequestSchema,
  type DepartmentListResponse,
  type DepartmentDetailResponse,
  type CreateDepartmentRequest,
  type UpdateDepartmentRequest,
} from '@repo/contracts';

@Controller('organizations/:organizationId/branches/:branchId/departments')
@UseGuards(AuthGuard, OrganizationAdminGuard)
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Get()
  async findAll(
    @Param('branchId') branchId: string,
  ): Promise<DepartmentListResponse> {
    return this.departmentsService.findAll(branchId);
  }

  @Get(':id')
  async findOne(
    @Param('branchId') branchId: string,
    @Param('id') id: string,
  ): Promise<DepartmentDetailResponse> {
    return this.departmentsService.findOne(branchId, id);
  }

  @Post()
  async create(
    @Param('branchId') branchId: string,
    @Body(new ZodValidationPipe(createDepartmentRequestSchema))
    data: CreateDepartmentRequest,
  ): Promise<DepartmentDetailResponse> {
    return this.departmentsService.create(branchId, data);
  }

  @Patch(':id')
  async update(
    @Param('branchId') branchId: string,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateDepartmentRequestSchema))
    data: UpdateDepartmentRequest,
  ): Promise<DepartmentDetailResponse> {
    return this.departmentsService.update(branchId, id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('branchId') branchId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.departmentsService.delete(branchId, id);
  }
}
