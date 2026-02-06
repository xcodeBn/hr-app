-- CreateEnum
CREATE TYPE "EmployeeStatus" AS ENUM ('ACTIVE', 'ON_BOARDING', 'PROBATION', 'ON_LEAVE', 'TERMINATED');

-- DropForeignKey
ALTER TABLE "Employment" DROP CONSTRAINT "Employment_jobTitleId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "employeeStatus" "EmployeeStatus";

-- CreateIndex
CREATE INDEX "User_employeeStatus_idx" ON "User"("employeeStatus");

-- AddForeignKey
ALTER TABLE "Employment" ADD CONSTRAINT "Employment_jobTitleId_fkey" FOREIGN KEY ("jobTitleId") REFERENCES "JobTitles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
