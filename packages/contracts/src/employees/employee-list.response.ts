import { z } from 'zod';
import { dateSchema } from '../common';
import {
  employeeStatusSchema,
  accountStatusSchema,
} from './employee-status.schema';

// ============================================================================
// Nested schemas for employee relationships
// ============================================================================

const lineManagerSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  profilePictureUrl: z.string().nullable(),
});

const departmentSchema = z.object({
  id: z.uuid(),
  name: z.string(),
});

const branchSchema = z.object({
  id: z.uuid(),
  name: z.string(),
});

const jobTitleSchema = z.object({
  id: z.uuid(),
  title: z.string(),
});

// ============================================================================
// Employee List Item Schema (for table view)
// ============================================================================

/**
 * Employee list item - minimal data for table display
 * Matches the columns in the Employees table UI
 */
export const employeeListItemSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  email: z.email(),
  profilePictureUrl: z.string().nullable(),
  employeeId: z.string().nullable(), // e.g., "GT001"
  jobTitle: jobTitleSchema.nullable(),
  lineManager: lineManagerSchema.nullable(),
  department: departmentSchema.nullable(),
  branch: branchSchema.nullable(), // "Office" in UI
  employeeStatus: employeeStatusSchema,
  accountStatus: accountStatusSchema,
});
export type EmployeeListItem = z.infer<typeof employeeListItemSchema>;

// ============================================================================
// Employee List Response Schema (paginated)
// ============================================================================

import { paginationMetaSchema } from '../common';

export const employeeListResponseSchema = z.object({
  employees: z.array(employeeListItemSchema),
  meta: paginationMetaSchema,
});
export type EmployeeListResponse = z.infer<typeof employeeListResponseSchema>;

// ============================================================================
// Employee List Query Schema (filters + pagination)
// ============================================================================

export const employeeListQuerySchema = z.object({
  // Pagination
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().int().positive()),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .pipe(z.number().int().min(1).max(100)),
  // Filters
  search: z.string().optional(),
  branchId: z.string().optional(), // "All Offices" filter
  jobTitleId: z.string().optional(), // "All Job Titles" filter
  status: employeeStatusSchema.optional(), // "All Status" filter
});
export type EmployeeListQuery = z.infer<typeof employeeListQuerySchema>;
