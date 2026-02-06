'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/use-auth';
import { useEmployees } from '@/hooks/use-employees';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Search,
  Download,
  Plus,
  ChevronLeft,
  ChevronRight,
  ShieldX,
  Users,
  Eye,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import type { EmployeeStatus } from '@repo/contracts';

// ============================================================================
// Types
// ============================================================================

type SortField =
  | 'name'
  | 'jobTitle'
  | 'lineManager'
  | 'department'
  | 'branch'
  | 'employeeStatus'
  | 'accountStatus';
type SortDirection = 'asc' | 'desc' | null;

interface SortConfig {
  field: SortField | null;
  direction: SortDirection;
}

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

const ACCOUNT_STATUS_LABELS: Record<string, string> = {
  ACTIVATED: 'Activated',
  NEED_INVITATION: 'Need Invitation',
  PENDING: 'Pending',
};

// ============================================================================
// Components
// ============================================================================

function EmployeeStatusBadge({ status }: { status: EmployeeStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${EMPLOYEE_STATUS_COLORS[status]}`}
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
        You don&apos;t have permission to access this page. Only Organization
        Admins can manage employees.
      </p>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-28" />
        </div>
      </div>
      <div className="flex gap-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="space-y-2">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
        <Users className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900">No employees found</h3>
      <p className="mt-1 text-sm text-gray-500">
        Get started by inviting your first employee.
      </p>
    </div>
  );
}

function SortableHeader({
  label,
  field,
  sortConfig,
  onSort,
}: {
  label: string;
  field: SortField;
  sortConfig: SortConfig;
  onSort: (field: SortField) => void;
}) {
  const isActive = sortConfig.field === field;

  return (
    <button
      className="flex items-center gap-1 hover:text-gray-900 transition-colors"
      onClick={() => onSort(field)}
    >
      {label}
      {isActive && sortConfig.direction === 'asc' ? (
        <ArrowUp className="h-4 w-4" />
      ) : isActive && sortConfig.direction === 'desc' ? (
        <ArrowDown className="h-4 w-4" />
      ) : (
        <ArrowUpDown className="h-4 w-4 opacity-50" />
      )}
    </button>
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

// ============================================================================
// Main Page
// ============================================================================

export default function ManageEmployeesPage() {
  const router = useRouter();
  const { user, isLoading: userLoading } = useUser();

  // Filters state
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<EmployeeStatus | 'all'>(
    'all',
  );
  const [searchInput, setSearchInput] = useState('');

  // Sorting state
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: null,
    direction: null,
  });

  const isOrgAdmin = user?.role === 'ORG_ADMIN';

  const { employees, meta, isLoading, error } = useEmployees({
    page,
    limit: 10,
    search: search || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
    enabled: isOrgAdmin,
  });

  // Handle sorting
  const handleSort = (field: SortField) => {
    setSortConfig((prev) => {
      if (prev.field !== field) {
        return { field, direction: 'asc' };
      }
      if (prev.direction === 'asc') {
        return { field, direction: 'desc' };
      }
      return { field: null, direction: null };
    });
  };

  // Sort employees
  const sortedEmployees = useMemo(() => {
    if (!employees || !sortConfig.field || !sortConfig.direction) {
      return employees;
    }

    return [...employees].sort((a, b) => {
      let aValue: string | null = null;
      let bValue: string | null = null;

      switch (sortConfig.field) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'jobTitle':
          aValue = a.jobTitle?.title ?? '';
          bValue = b.jobTitle?.title ?? '';
          break;
        case 'lineManager':
          aValue = a.lineManager?.name ?? '';
          bValue = b.lineManager?.name ?? '';
          break;
        case 'department':
          aValue = a.department?.name ?? '';
          bValue = b.department?.name ?? '';
          break;
        case 'branch':
          aValue = a.branch?.name ?? '';
          bValue = b.branch?.name ?? '';
          break;
        case 'employeeStatus':
          aValue = a.employeeStatus;
          bValue = b.employeeStatus;
          break;
        case 'accountStatus':
          aValue = a.accountStatus;
          bValue = b.accountStatus;
          break;
      }

      if (aValue === null || bValue === null) return 0;

      const comparison = aValue.localeCompare(bValue);
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [employees, sortConfig]);

  // Handle search on enter
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setSearch(searchInput);
      setPage(1);
    }
  };

  // Loading state
  if (userLoading) {
    return <LoadingSkeleton />;
  }

  // Access control
  if (!isOrgAdmin) {
    return <ForbiddenPage />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your Employee</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add New
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search employee"
            className="pl-10"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All Offices" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Offices</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All Job Titles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Job Titles</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value as EmployeeStatus | 'all');
            setPage(1);
          }}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="ON_BOARDING">On Boarding</SelectItem>
            <SelectItem value="PROBATION">Probation</SelectItem>
            <SelectItem value="ON_LEAVE">On Leave</SelectItem>
            <SelectItem value="TERMINATED">Terminated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-10 text-red-500">
          Failed to load employees. Please try again.
        </div>
      ) : !employees || employees.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="rounded-lg border bg-white">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-12">
                    <Checkbox />
                  </TableHead>
                  <TableHead>
                    <SortableHeader
                      label="Employee Name"
                      field="name"
                      sortConfig={sortConfig}
                      onSort={handleSort}
                    />
                  </TableHead>
                  <TableHead>
                    <SortableHeader
                      label="Job Title"
                      field="jobTitle"
                      sortConfig={sortConfig}
                      onSort={handleSort}
                    />
                  </TableHead>
                  <TableHead>
                    <SortableHeader
                      label="Line Manager"
                      field="lineManager"
                      sortConfig={sortConfig}
                      onSort={handleSort}
                    />
                  </TableHead>
                  <TableHead>
                    <SortableHeader
                      label="Department"
                      field="department"
                      sortConfig={sortConfig}
                      onSort={handleSort}
                    />
                  </TableHead>
                  <TableHead>
                    <SortableHeader
                      label="Office"
                      field="branch"
                      sortConfig={sortConfig}
                      onSort={handleSort}
                    />
                  </TableHead>
                  <TableHead>
                    <SortableHeader
                      label="Employee Status"
                      field="employeeStatus"
                      sortConfig={sortConfig}
                      onSort={handleSort}
                    />
                  </TableHead>
                  <TableHead>
                    <SortableHeader
                      label="Account"
                      field="accountStatus"
                      sortConfig={sortConfig}
                      onSort={handleSort}
                    />
                  </TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedEmployees?.map((employee) => (
                  <TableRow
                    key={employee.id}
                    className="cursor-pointer"
                    onClick={() =>
                      router.push(`/employees/manage-employees/${employee.id}`)
                    }
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={employee.profilePictureUrl ?? undefined}
                          />
                          <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                            {getInitials(employee.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-gray-900">
                            {employee.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {employee.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {employee.jobTitle?.title ?? '-'}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {employee.lineManager ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src={
                                employee.lineManager.profilePictureUrl ??
                                undefined
                              }
                            />
                            <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                              {getInitials(employee.lineManager.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span>
                            @{employee.lineManager.name.split(' ')[0]}
                          </span>
                        </div>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {employee.department?.name ?? '-'}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {employee.branch?.name ?? '-'}
                    </TableCell>
                    <TableCell>
                      <EmployeeStatusBadge status={employee.employeeStatus} />
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {ACCOUNT_STATUS_LABELS[employee.accountStatus]}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(
                            `/employees/manage-employees/${employee.id}`,
                          );
                        }}
                      >
                        <Eye className="h-4 w-4 text-green-600" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {meta && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={!meta.hasPrevPage}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from(
                  { length: Math.min(meta.totalPages, 3) },
                  (_, i) => (
                    <Button
                      key={i + 1}
                      variant={page === i + 1 ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPage(i + 1)}
                    >
                      {i + 1}
                    </Button>
                  ),
                )}
                {meta.totalPages > 3 && (
                  <>
                    <span className="text-gray-400">...</span>
                    <Button
                      variant={page === meta.totalPages ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPage(meta.totalPages)}
                    >
                      {meta.totalPages}
                    </Button>
                  </>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={!meta.hasNextPage}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-sm text-gray-500">
                Showing {(page - 1) * meta.limit + 1} to{' '}
                {Math.min(page * meta.limit, meta.total)} of {meta.total}{' '}
                entries
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
