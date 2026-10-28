import { z } from 'zod';

export const proposalMilestoneSchema = z.object({
  title: z
    .string()
    .min(2, '请填写里程碑名称（至少 2 个字符）')
    .max(120, '里程碑名称最多 120 个字符'),
  amount: z.number().int().positive('里程碑金额必须大于 0'), // minor units
  dueInDays: z
    .number()
    .int()
    .positive('工期天数必须大于 0')
    .max(3650, '工期天数最多 3650 天')
    .optional(),
});

export const createProposalSchema = z.object({
  jobId: z.string().cuid(),
  coverLetter: z
    .string()
    .min(40, '投标说明至少 40 个字符，写得更充分能提高中标率')
    .max(10_000, '投标说明最多 10000 个字符'),
  bidAmount: z.number().int().positive('报价必须大于 0'), // minor units
  bidType: z.enum(['HOURLY', 'FIXED']),
  estimatedDays: z
    .number()
    .int()
    .positive('预计工期必须大于 0')
    .max(3650, '预计工期最多 3650 天')
    .optional(),
  milestones: z.array(proposalMilestoneSchema).max(20).default([]),
});

export type CreateProposalInput = z.infer<typeof createProposalSchema>;
