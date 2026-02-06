'use client';

import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@/hooks/use-auth';
import { useEmployee } from '@/hooks/use-employees';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ChevronLeft,
  Mail,
  Phone,
  Globe,
  ShieldX,
  ChevronDown,
} from 'lucide-react';
import type { EmployeeStatus } from '@repo/contracts';

// ============================================================================
// Constants
// ============================================================================

const EMPLOYEE_STATUS_LABELS: Record<EmployeeStatus, string> = {
  ACTIVE: 'Active',
  ON_BOARDING: 'On Boarding',
  PROBATION: 'Probation',
  ON_LEAVE: 'On Leave',
  TERMINATED: 'Terminated',
};

const EMPLOYEE_STATUS_COLORS: Record<EmployeeStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  ON_BOARDING: 'bg-blue-100 text-blue-700',
  PROBATION: 'bg-yellow-100 text-yellow-700',
  ON_LEAVE: 'bg-orange-100 text-orange-700',
  TERMINATED: 'bg-red-100 text-red-700',
};

const GENDER_LABELS: Record<string, string> = {
  MALE: 'Male',
  FEMALE: 'Female',
  OTHER: 'Other',
  PREFER_NOT_TO_SAY: 'Prefer not to say',
};

const MARITAL_STATUS_LABELS: Record<string, string> = {
  SINGLE: 'Single',
  MARRIED: 'Married',
  DIVORCED: 'Divorced',
  WIDOWED: 'Widowed',
  PREFER_NOT_TO_SAY: 'Prefer not to say',
};

// ============================================================================
// Components
// ============================================================================

function EmployeeStatusBadge({ status }: { status: EmployeeStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${EMPLOYEE_STATUS_COLORS[status]}`}
    >
      {EMPLOYEE_STATUS_LABELS[status]}
    </span>
  );
}

function ForbiddenPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <ShieldX className="h-16 w-16 text-red-400 mb-4" />
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
      <p className="text-gray-500 text-center max-w-md">
        You don&apos;t have permission to access this page.
      </p>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="flex gap-8">
        <div className="w-64 space-y-4">
          <Skeleton className="h-32 w-32 rounded-full mx-auto" />
          <Skeleton className="h-6 w-40 mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
        <div className="flex-1 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    </div>
  );
}

function InfoField({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-500 mb-1">
        {label}
      </label>
      <div className="text-gray-900 bg-gray-50 rounded-lg px-4 py-3">
        {value || '-'}
      </div>
    </div>
  );
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// ============================================================================
// Main Page
// ============================================================================

export default function EmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: userLoading } = useUser();
  const employeeId = params.id as string;

  const isOrgAdmin = user?.role === 'ORG_ADMIN';

  const { employee, isLoading, error } = useEmployee(employeeId, {
    enabled: isOrgAdmin && !!employeeId,
  });

  if (userLoading || isLoading) {
    return <LoadingSkeleton />;
  }

  if (!isOrgAdmin) {
    return <ForbiddenPage />;
  }

  if (error || !employee) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Employee not found
        </h2>
        <p className="text-gray-500 mb-4">
          The employee you&apos;re looking for doesn&apos;t exist or you
          don&apos;t have access.
        </p>
        <Button onClick={() => router.push('/employees/manage-employees')}>
          Back to Employees
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button & Title */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/employees/manage-employees')}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Detail Employee</h1>
      </div>

      {/* Main content */}
      <div className="flex gap-8">
        {/* Left sidebar - Employee info card */}
        <div className="w-72 shrink-0">
          <div className="bg-white rounded-lg border p-6 space-y-6">
            {/* Avatar & Name */}
            <div className="text-center">
              <Avatar className="h-24 w-24 mx-auto mb-4">
                <AvatarImage
                  src={employee.profile?.profilePictureUrl ?? undefined}
                />
                <AvatarFallback className="bg-gray-200 text-gray-600 text-xl">
                  {getInitials(employee.name)}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-semibold text-gray-900">
                {employee.name}
              </h2>
              <p className="text-gray-500">
                {employee.employment?.jobTitle?.title ?? 'No job title'}
              </p>
              <div className="mt-3">
                <EmployeeStatusBadge status={employee.employeeStatus} />
              </div>
            </div>

            {/* Contact info */}
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-gray-600">
                <Mail className="h-4 w-4" />
                <span>{employee.email}</span>
              </div>
              {employee.profile?.phoneNumber && (
                <div className="flex items-center gap-3 text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{employee.profile.phoneNumber}</span>
                </div>
              )}
              {employee.profile?.timezone && (
                <div className="flex items-center gap-3 text-gray-600">
                  <Globe className="h-4 w-4" />
                  <span>{employee.profile.timezone}</span>
                </div>
              )}
            </div>

            {/* Department & Office */}
            <div className="space-y-3 text-sm border-t pt-4">
              <div>
                <span className="text-gray-500">Department</span>
                <p className="font-medium text-gray-900">
                  {employee.employment?.department?.name ?? '-'}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Office</span>
                <p className="font-medium text-gray-900">
                  {employee.employment?.branch?.name ?? '-'}
                </p>
              </div>
              {employee.employment?.lineManager && (
                <div>
                  <span className="text-gray-500">Line Manager</span>
                  <div className="flex items-center gap-2 mt-1">
                    <Avatar className="h-6 w-6">
                      <AvatarImage
                        src={
                          employee.employment.lineManager.profilePictureUrl ??
                          undefined
                        }
                      />
                      <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                        {getInitials(employee.employment.lineManager.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-gray-900">
                      {employee.employment.lineManager.name}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Action button */}
            <Button className="w-full">
              Action
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Right content - Tabs */}
        <div className="flex-1">
          {/* Tabs */}
          <div className="border-b mb-6">
            <nav className="flex gap-8">
              <button className="pb-3 text-green-600 border-b-2 border-green-600 font-medium">
                General
              </button>
              <button className="pb-3 text-gray-500 hover:text-gray-700">
                Job
              </button>
              <button className="pb-3 text-gray-500 hover:text-gray-700">
                Payroll
              </button>
              <button className="pb-3 text-gray-500 hover:text-gray-700">
                Documents
              </button>
              <button className="pb-3 text-gray-500 hover:text-gray-700">
                Setting
              </button>
            </nav>
          </div>

          {/* Personal Info Section */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Personal Info
            </h3>

            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2">
                <InfoField label="Full Name *" value={employee.name} />
              </div>

              <InfoField
                label="Gender *"
                value={
                  employee.profile?.gender
                    ? GENDER_LABELS[employee.profile.gender]
                    : null
                }
              />
              <InfoField
                label="Date of Birth"
                value={formatDate(employee.profile?.dateOfBirth)}
              />

              <InfoField label="Email Address *" value={employee.email} />
              <InfoField
                label="Phone Number *"
                value={employee.profile?.phoneNumber}
              />

              <InfoField
                label="Nationality *"
                value={employee.profile?.nationality}
              />
              <InfoField
                label="Health Care *"
                value={employee.profile?.insuranceProvider}
              />

              <InfoField
                label="Marital Status *"
                value={
                  employee.profile?.maritalStatus
                    ? MARITAL_STATUS_LABELS[employee.profile.maritalStatus]
                    : null
                }
              />
              <InfoField
                label="Personal Tax ID *"
                value={employee.profile?.personalTaxId}
              />

              <div className="col-span-2">
                <InfoField
                  label="Social Insurance *"
                  value={employee.profile?.socialInsuranceNumber}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
