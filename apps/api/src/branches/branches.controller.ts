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
import { BranchesService } from './branches.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { OrganizationAdminGuard } from '../auth/guards/organaization-admin-gaurd';
import { ZodValidationPipe } from '../common';
import {
  createBranchRequestSchema,
  updateBranchRequestSchema,
  type BranchListResponse,
  type BranchDetailResponse,
  type CreateBranchRequest,
  type UpdateBranchRequest,
} from '@repo/contracts';

@Controller('organizations/:organizationId/branches')
@UseGuards(AuthGuard, OrganizationAdminGuard)
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Get()
  async findAll(
    @Param('organizationId') organizationId: string,
  ): Promise<BranchListResponse> {
    return this.branchesService.findAll(organizationId);
  }

  @Get(':id')
  async findOne(
    @Param('organizationId') organizationId: string,
    @Param('id') id: string,
  ): Promise<BranchDetailResponse> {
    return this.branchesService.findOne(organizationId, id);
  }

  @Post()
  async create(
    @Param('organizationId') organizationId: string,
    @Body(new ZodValidationPipe(createBranchRequestSchema))
    data: CreateBranchRequest,
  ): Promise<BranchDetailResponse> {
    return this.branchesService.create(organizationId, data);
  }

  @Patch(':id')
  async update(
    @Param('organizationId') organizationId: string,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateBranchRequestSchema))
    data: UpdateBranchRequest,
  ): Promise<BranchDetailResponse> {
    return this.branchesService.update(organizationId, id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('organizationId') organizationId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.branchesService.delete(organizationId, id);
  }
}
