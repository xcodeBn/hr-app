import { z } from 'zod';

// ============================================================================
// Pagination Request Schema (for query params)
// ============================================================================

/**
 * Schema for pagination query parameters
 * - page: 1-based page number (default: 1)
 * - limit: items per page (default: 10, max: 100)
 *
 * Usage in NestJS controller:
 * @Query() query: PaginationQuery
 *
 * Query params come as strings, so we coerce them to numbers
 */
export const paginationQuerySchema = z.object({
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
});
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

// ============================================================================
// Pagination Metadata Response Schema (for API responses)
// ============================================================================

/**
 * Schema for pagination metadata in API responses
 * Includes all info needed to render pagination UI
 */
export const paginationMetaSchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
  hasNextPage: z.boolean(),
  hasPrevPage: z.boolean(),
});
export type PaginationMeta = z.infer<typeof paginationMetaSchema>;

// ============================================================================
// Helper function to calculate pagination metadata
// ============================================================================

/**
 * Calculate pagination metadata from total count and current page/limit
 *
 * Usage in service:
 * const meta = calculatePaginationMeta({ page: 1, limit: 10, total: 95 });
 */
export function calculatePaginationMeta(params: {
  page: number;
  limit: number;
  total: number;
}): PaginationMeta {
  const { page, limit, total } = params;
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

// ============================================================================
// Generic Paginated Response Schema Factory
// ============================================================================

/**
 * Creates a paginated response schema for any item type
 *
 * Usage:
 * const employeeListResponseSchema = createPaginatedResponseSchema(
 *   employeeListItemSchema,
 *   'employees'
 * );
 */
export function createPaginatedResponseSchema<T extends z.ZodTypeAny>(
  itemSchema: T,
  itemsKey: string,
) {
  return z.object({
    [itemsKey]: z.array(itemSchema),
    meta: paginationMetaSchema,
  });
}
