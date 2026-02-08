-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "private";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'ORG_ADMIN', 'EMPLOYEE');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY');

-- CreateEnum
CREATE TYPE "OrganizationStatus" AS ENUM ('PENDING', 'ACTIVE', 'REJECTED', 'SUSPENDED', 'INACTIVE');

-- CreateEnum
CREATE TYPE "EmployeeStatus" AS ENUM ('ACTIVE', 'ON_BOARDING', 'PROBATION', 'ON_LEAVE', 'TERMINATED');

-- CreateEnum
CREATE TYPE "MaritalStatus" AS ENUM ('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED', 'PREFER_NOT_TO_SAY');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('ID_CARD', 'PASSPORT', 'DRIVERS_LICENSE', 'BIRTH_CERTIFICATE', 'SOCIAL_SECURITY_CARD', 'TAX_DOCUMENT', 'EMPLOYMENT_CONTRACT', 'RESUME', 'DEGREE_CERTIFICATE', 'TRAINING_CERTIFICATE', 'MEDICAL_CERTIFICATE', 'BANK_STATEMENT', 'PROOF_OF_ADDRESS', 'OTHER');

-- CreateEnum
CREATE TYPE "WorkScheduleType" AS ENUM ('DURATION_BASED', 'TIME_BASED', 'FLEXIBLE');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PENDING', 'COMPLETED', 'APPROVED', 'REJECTED', 'ABSENT');

-- CreateEnum
CREATE TYPE "ContractType" AS ENUM ('FULLTIME_PERMANENT', 'FULLTIME_FIXED_TERM', 'PARTTIME_PERMANENT', 'PARTTIME_FIXED_TERM', 'CONTRACTOR', 'FREELANCE', 'INTERN');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('FULLTIME', 'PARTTIME', 'CONTRACT', 'INTERN', 'FREELANCE');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('USER_CREATED', 'USER_UPDATED', 'USER_DELETED', 'USER_INVITED', 'USER_ROLE_CHANGED', 'ORGANIZATION_CREATED', 'ORGANIZATION_APPROVED', 'ORGANIZATION_REJECTED', 'ORGANIZATION_SUSPENDED', 'ORGANIZATION_UPDATED', 'DEPARTMENT_CREATED', 'DEPARTMENT_UPDATED', 'DEPARTMENT_DELETED', 'BRANCH_CREATED', 'BRANCH_UPDATED', 'BRANCH_DELETED', 'EMPLOYEE_HIRED', 'EMPLOYEE_PROMOTED', 'EMPLOYEE_TRANSFERRED', 'EMPLOYEE_TERMINATED', 'CONTRACT_CREATED', 'CONTRACT_UPDATED', 'CONTRACT_ENDED', 'ATTENDANCE_CLOCKED_IN', 'ATTENDANCE_CLOCKED_OUT', 'ATTENDANCE_APPROVED', 'ATTENDANCE_REJECTED', 'ATTENDANCE_UPDATED', 'SCHEDULE_CREATED', 'SCHEDULE_UPDATED', 'SCHEDULE_DELETED', 'DOCUMENT_UPLOADED', 'DOCUMENT_DELETED', 'DOCUMENT_ACCESSED', 'TIME_OFF_REQUESTED', 'TIME_OFF_APPROVED', 'TIME_OFF_REJECTED', 'TIME_OFF_CANCELLED', 'SETTINGS_UPDATED', 'OTHER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "isConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'EMPLOYEE',
    "employeeStatus" "EmployeeStatus",
    "organizationId" TEXT,
    "departmentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "gender" "Gender",
    "bio" TEXT,
    "phoneNumber" TEXT,
    "street1" TEXT,
    "street2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "postalCode" TEXT,
    "country" TEXT,
    "insuranceProvider" TEXT,
    "personalTaxId" TEXT,
    "maritalStatus" "MaritalStatus",
    "socialInsuranceNumber" TEXT,
    "emergencyContactName" TEXT,
    "emergencyContactPhone" TEXT,
    "emergencyContactRelation" TEXT,
    "nationality" TEXT,
    "profilePictureUrl" TEXT,
    "timezone" TEXT DEFAULT 'UTC',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "private"."Password" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "hashedPassword" TEXT NOT NULL,
    "failedLoginCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Password_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "private"."Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "private"."MagicLink" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MagicLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "OrganizationStatus" NOT NULL DEFAULT 'PENDING',
    "description" TEXT,
    "website" TEXT,
    "createdById" TEXT NOT NULL,
    "approvedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "approvedAt" TIMESTAMP(3),

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Branch" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "street1" TEXT,
    "street2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "postalCode" TEXT,
    "country" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Branch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contractNumber" TEXT NOT NULL,
    "contractName" TEXT NOT NULL,
    "contractType" "ContractType" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "jobTitleId" TEXT NOT NULL,
    "employmentType" "EmploymentType" NOT NULL,
    "lineManagerId" TEXT,
    "departmentId" TEXT,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobTitles" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobTitles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Documents" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "documentType" "DocumentType" NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "clockIn" TIMESTAMP(3),
    "clockInLocation" TEXT,
    "clockInTimezone" TEXT,
    "clockOut" TIMESTAMP(3),
    "clockOutLocation" TEXT,
    "clockOutTimezone" TEXT,
    "scheduledHours" DECIMAL(5,2) NOT NULL,
    "loggedHours" DECIMAL(5,2) NOT NULL,
    "paidHours" DECIMAL(5,2) NOT NULL,
    "deficitHours" DECIMAL(5,2) NOT NULL,
    "overtimeHours" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "status" "AttendanceStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkSchedule" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "scheduleType" "WorkScheduleType" NOT NULL DEFAULT 'DURATION_BASED',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "standardHoursPerDay" DECIMAL(5,2),
    "totalWeeklyHours" DECIMAL(5,2) NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkScheduleDay" (
    "id" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "hoursPerDay" DECIMAL(5,2) NOT NULL,
    "startTime" TEXT,
    "endTime" TEXT,
    "isWorkingDay" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkScheduleDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserWorkSchedule" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserWorkSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "userId" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_organizationId_idx" ON "User"("organizationId");

-- CreateIndex
CREATE INDEX "User_departmentId_idx" ON "User"("departmentId");

-- CreateIndex
CREATE INDEX "User_employeeStatus_idx" ON "User"("employeeStatus");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Password_userId_key" ON "private"."Password"("userId");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "private"."Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MagicLink_token_key" ON "private"."MagicLink"("token");

-- CreateIndex
CREATE INDEX "MagicLink_token_idx" ON "private"."MagicLink"("token");

-- CreateIndex
CREATE INDEX "MagicLink_userId_idx" ON "private"."MagicLink"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_createdById_key" ON "Organization"("createdById");

-- CreateIndex
CREATE INDEX "Organization_approvedById_idx" ON "Organization"("approvedById");

-- CreateIndex
CREATE INDEX "Organization_status_idx" ON "Organization"("status");

-- CreateIndex
CREATE INDEX "Branch_organizationId_idx" ON "Branch"("organizationId");

-- CreateIndex
CREATE INDEX "Department_branchId_idx" ON "Department"("branchId");

-- CreateIndex
CREATE UNIQUE INDEX "Contract_contractNumber_key" ON "Contract"("contractNumber");

-- CreateIndex
CREATE INDEX "Contract_userId_idx" ON "Contract"("userId");

-- CreateIndex
CREATE INDEX "Contract_contractNumber_idx" ON "Contract"("contractNumber");

-- CreateIndex
CREATE INDEX "Contract_isActive_idx" ON "Contract"("isActive");

-- CreateIndex
CREATE INDEX "Employment_userId_idx" ON "Employment"("userId");

-- CreateIndex
CREATE INDEX "Employment_employeeId_idx" ON "Employment"("employeeId");

-- CreateIndex
CREATE INDEX "Employment_lineManagerId_idx" ON "Employment"("lineManagerId");

-- CreateIndex
CREATE INDEX "Employment_departmentId_idx" ON "Employment"("departmentId");

-- CreateIndex
CREATE INDEX "Employment_isActive_idx" ON "Employment"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "JobTitles_title_key" ON "JobTitles"("title");

-- CreateIndex
CREATE INDEX "Documents_userId_idx" ON "Documents"("userId");

-- CreateIndex
CREATE INDEX "Documents_organizationId_idx" ON "Documents"("organizationId");

-- CreateIndex
CREATE INDEX "Documents_documentType_idx" ON "Documents"("documentType");

-- CreateIndex
CREATE INDEX "Attendance_userId_idx" ON "Attendance"("userId");

-- CreateIndex
CREATE INDEX "Attendance_date_idx" ON "Attendance"("date");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_userId_date_key" ON "Attendance"("userId", "date");

-- CreateIndex
CREATE INDEX "WorkSchedule_organizationId_idx" ON "WorkSchedule"("organizationId");

-- CreateIndex
CREATE INDEX "WorkSchedule_isDefault_idx" ON "WorkSchedule"("isDefault");

-- CreateIndex
CREATE INDEX "WorkSchedule_isActive_idx" ON "WorkSchedule"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "WorkSchedule_organizationId_name_key" ON "WorkSchedule"("organizationId", "name");

-- CreateIndex
CREATE INDEX "WorkScheduleDay_scheduleId_idx" ON "WorkScheduleDay"("scheduleId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkScheduleDay_scheduleId_dayOfWeek_key" ON "WorkScheduleDay"("scheduleId", "dayOfWeek");

-- CreateIndex
CREATE INDEX "UserWorkSchedule_userId_idx" ON "UserWorkSchedule"("userId");

-- CreateIndex
CREATE INDEX "UserWorkSchedule_scheduleId_idx" ON "UserWorkSchedule"("scheduleId");

-- CreateIndex
CREATE INDEX "UserWorkSchedule_isActive_idx" ON "UserWorkSchedule"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "UserWorkSchedule_userId_scheduleId_key" ON "UserWorkSchedule"("userId", "scheduleId");

-- CreateIndex
CREATE INDEX "AuditLog_organizationId_idx" ON "AuditLog"("organizationId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_idx" ON "AuditLog"("entityType");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "private"."Password" ADD CONSTRAINT "Password_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "private"."Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "private"."MagicLink" ADD CONSTRAINT "MagicLink_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employment" ADD CONSTRAINT "Employment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employment" ADD CONSTRAINT "Employment_lineManagerId_fkey" FOREIGN KEY ("lineManagerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employment" ADD CONSTRAINT "Employment_jobTitleId_fkey" FOREIGN KEY ("jobTitleId") REFERENCES "JobTitles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employment" ADD CONSTRAINT "Employment_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documents" ADD CONSTRAINT "Documents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documents" ADD CONSTRAINT "Documents_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkSchedule" ADD CONSTRAINT "WorkSchedule_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkScheduleDay" ADD CONSTRAINT "WorkScheduleDay_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "WorkSchedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserWorkSchedule" ADD CONSTRAINT "UserWorkSchedule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserWorkSchedule" ADD CONSTRAINT "UserWorkSchedule_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "WorkSchedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

