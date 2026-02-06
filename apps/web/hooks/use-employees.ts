'use client';

import useSWR from 'swr';
import type {
  EmployeeListResponse,
  EmployeeDetailResponse,
  EmployeeStatus,
  PaginationMeta,
} from '@repo/contracts';

// ============================================================================
// Types
// ============================================================================

interface UseEmployeesOptions {
  page?: number;
  limit?: number;
  search?: string;
  branchId?: string;
  jobTitleId?: string;
  status?: EmployeeStatus;
  enabled?: boolean;
}

interface UseEmployeesReturn {
  employees: EmployeeListResponse['employees'] | undefined;
  meta: PaginationMeta | undefined;
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => void;
}

interface UseEmployeeOptions {
  enabled?: boolean;
}

interface UseEmployeeReturn {
  employee: EmployeeDetailResponse | undefined;
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => void;
}

// ============================================================================
// Build query string helper
// ============================================================================

function buildQueryString(
  params: Record<string, string | number | undefined>,
): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

// ============================================================================
// useEmployees - List employees with pagination and filters
// ============================================================================

/**
 * Hook for fetching employees list with pagination and filters
 * Only accessible by ORG_ADMIN users
 */
export function useEmployees(
  options: UseEmployeesOptions = {},
): UseEmployeesReturn {
  const {
    page = 1,
    limit = 10,
    search,
    branchId,
    jobTitleId,
    status,
    enabled = true,
  } = options;

  const queryString = buildQueryString({
    page,
    limit,
    search,
    branchId,
    jobTitleId,
    status,
  });

  const endpoint = `/employees${queryString}`;

  const {
    data,
    error,
    isLoading,
    mutate: swrMutate,
  } = useSWR<EmployeeListResponse>(enabled ? endpoint : null);

  return {
    employees: data?.employees,
    meta: data?.meta,
    isLoading,
    error,
    mutate: swrMutate,
  };
}

// ============================================================================
// useEmployee - Get single employee detail
// ============================================================================

/**
 * Hook for fetching a single employee's details
 * Only accessible by ORG_ADMIN users
 */
export function useEmployee(
  id: string | null,
  options: UseEmployeeOptions = {},
): UseEmployeeReturn {
  const { enabled = true } = options;

  const {
    data,
    error,
    isLoading,
    mutate: swrMutate,
  } = useSWR<EmployeeDetailResponse>(enabled && id ? `/employees/${id}` : null);

  return {
    employee: data,
    isLoading,
    error,
    mutate: swrMutate,
  };
}
