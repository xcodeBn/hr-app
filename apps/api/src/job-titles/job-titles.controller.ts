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
import { JobTitlesService } from './job-titles.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators';
import { ZodValidationPipe } from '../common/pipes';
import {
  createJobTitleRequestSchema,
  updateJobTitleRequestSchema,
  type JobTitleListResponse,
  type JobTitle,
  type CreateJobTitleRequest,
  type UpdateJobTitleRequest,
} from '@repo/contracts';

@Controller('job-titles')
@UseGuards(AuthGuard)
export class JobTitlesController {
  constructor(private readonly jobTitlesService: JobTitlesService) {}

  @Get()
  async findAll(): Promise<JobTitleListResponse> {
    return this.jobTitlesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<JobTitle> {
    return this.jobTitlesService.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'ORG_ADMIN')
  async create(
    @Body(new ZodValidationPipe(createJobTitleRequestSchema))
    data: CreateJobTitleRequest,
  ): Promise<JobTitle> {
    return this.jobTitlesService.create(data);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'ORG_ADMIN')
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateJobTitleRequestSchema))
    data: UpdateJobTitleRequest,
  ): Promise<JobTitle> {
    return this.jobTitlesService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    return this.jobTitlesService.delete(id);
  }
}
