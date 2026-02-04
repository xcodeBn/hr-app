import { z } from 'zod';

/**
 * Schema for Prisma Decimal fields.
 *
 * Following Prisma's recommended approach for Zod validation:
 * - For INPUT (creating/updating): accepts number or string
 * - For OUTPUT (responses): Prisma returns Decimal objects which serialize to string in JSON
 *
 * @see https://www.prisma.io/docs/orm/prisma-client/queries/custom-validation
 */

// For input validation (when creating/updating records)
export const decimalInputSchema = z.union([
  z.number(),
  z.string().regex(/^-?\d+(\.\d+)?$/, { error: 'Invalid decimal format' }),
]);

// For output/response (Prisma returns Decimal objects that serialize to strings)
// This schema is permissive to accept Decimal objects from Prisma
export const decimalSchema = z.union([
  z.number(),
  z.string(),
  // Accept any object with toString (Decimal from Prisma)
  z.object({}).passthrough(),
]);
