import { z } from 'zod';
import { dateSchema } from '../common';
import {
  employeeStatusSchema,
  accountStatusSchema,
} from './employee-status.schema';

// ============================================================================
// Gender Schema
// ============================================================================

export const genderSchema = z.enum([
  'MALE',
  'FEMALE',
  'OTHER',
  'PREFER_NOT_TO_SAY',
]);
export type Gender = z.infer<typeof genderSchema>;

// ============================================================================
// Marital Status Schema
// ============================================================================

export const maritalStatusSchema = z.enum([
  'SINGLE',
  'MARRIED',
  'DIVORCED',
  'WIDOWED',
  'PREFER_NOT_TO_SAY',
]);
export type MaritalStatus = z.infer<typeof maritalStatusSchema>;

// ============================================================================
// Nested schemas for employee detail
// ============================================================================

const lineManagerDetailSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  email: z.email(),
  profilePictureUrl: z.string().nullable(),
});

const departmentDetailSchema = z.object({
  id: z.uuid(),
  name: z.string(),
});

const branchDetailSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  city: z.string().nullable(),
  country: z.string().nullable(),
});

const jobTitleDetailSchema = z.object({
  id: z.uuid(),
  title: z.string(),
});

// ============================================================================
// Employee Profile Schema (personal info from UserProfile)
// ============================================================================

const employeeProfileSchema = z.object({
  dateOfBirth: dateSchema.nullable(),
  gender: genderSchema.nullable(),
  phoneNumber: z.string().nullable(),
  nationality: z.string().nullable(),
  maritalStatus: maritalStatusSchema.nullable(),
  profilePictureUrl: z.string().nullable(),
  timezone: z.string().nullable(),
  // Insurance & Tax
  insuranceProvider: z.string().nullable(),
  personalTaxId: z.string().nullable(),
  socialInsuranceNumber: z.string().nullable(),
  // Address
  street1: z.string().nullable(),
  street2: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  postalCode: z.string().nullable(),
  country: z.string().nullable(),
  // Emergency contact
  emergencyContactName: z.string().nullable(),
  emergencyContactPhone: z.string().nullable(),
  emergencyContactRelation: z.string().nullable(),
});

// ============================================================================
// Employment Info Schema (job-related data)
// ============================================================================

const employmentInfoSchema = z.object({
  employeeId: z.string(), // e.g., "GT001"
  jobTitle: jobTitleDetailSchema,
  department: departmentDetailSchema.nullable(),
  branch: branchDetailSchema.nullable(),
  lineManager: lineManagerDetailSchema.nullable(),
  employmentType: z.string(), // FULLTIME, PARTTIME, etc.
  effectiveDate: dateSchema,
  endDate: dateSchema.nullable(),
});

// ============================================================================
// Employee Detail Response Schema
// ============================================================================

/**
 * Full employee detail - all data for the employee detail page
 * Includes: basic info, profile (personal), employment (job)
 */
export const employeeDetailResponseSchema = z.object({
  // Basic info
  id: z.uuid(),
  name: z.string(),
  email: z.email(),
  employeeStatus: employeeStatusSchema,
  accountStatus: accountStatusSchema,
  isConfirmed: z.boolean(),
  createdAt: dateSchema,
  updatedAt: dateSchema,
  // Nested data
  profile: employeeProfileSchema.nullable(),
  employment: employmentInfoSchema.nullable(),
});
export type EmployeeDetailResponse = z.infer<
  typeof employeeDetailResponseSchema
>;
