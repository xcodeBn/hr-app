import { z } from 'zod';

export const clockInRequestSchema = z.object({
  location: z.string().optional(),
  timezone: z.string().optional(), // IANA timezone, e.g., "Asia/Bangkok"
  notes: z.string().optional(),
});

export type ClockInRequest = z.infer<typeof clockInRequestSchema>;
