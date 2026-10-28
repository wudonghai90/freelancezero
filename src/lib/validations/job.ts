import { z } from 'zod';

/**
 * Shared job validation — used by both the API route and the client form,
 * so the rules live in exactly one place.
 */
export const createJobSchema = z
  .object({
    title: z
      .string()
      .min(8, '请填写更清晰的需求标题（至少 8 个字符）')
      .max(120, '标题最多 120 个字符'),
    description: z
      .string()
      .min(40, '请更详细地描述需求（至少 40 个字符）')
      .max(20_000, '需求描述最多 20000 个字符'),
    budgetType: z.enum(['HOURLY', 'FIXED']),
    // Amounts are entered in major units in the UI and converted to minor units
    // (cents) before hitting the API. Here we validate the minor-unit integers.
    budgetMin: z.number().int().nonnegative().optional(),
    budgetMax: z.number().int().nonnegative().optional(),
    currency: z.string().length(3).default('CNY'),
    experience: z.enum(['ENTRY', 'INTERMEDIATE', 'EXPERT']).default('INTERMEDIATE'),
    estimatedDays: z.number().int().positive().max(3650).optional(),
    skillIds: z.array(z.string().cuid()).max(15).default([]),
  })
  .refine(
    (v) => v.budgetMin == null || v.budgetMax == null || v.budgetMax >= v.budgetMin,
    { message: '最高预算不能低于最低预算', path: ['budgetMax'] },
  );

export type CreateJobInput = z.infer<typeof createJobSchema>;
