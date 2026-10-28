import { z } from 'zod';

// Letters (any language), apostrophes, hyphens, spaces — e.g. "José", "O'Neill",
// "Anne-Marie". Blocks digits/symbols that have no place in a legal name.
const nameField = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `请填写${label}`)
    .max(50, `${label}最多 50 个字符`)
    .regex(/^[\p{L}\p{M}'’ -]+$/u, `${label}包含无效字符`);

export const registerSchema = z
  .object({
    firstName: nameField('名字'),
    lastName: nameField('姓氏'),
    email: z.string().trim().toLowerCase().email('请输入有效的邮箱地址'),
    password: z
      .string()
      .min(8, '密码至少 8 位')
      .max(100, '密码最多 100 位')
      .regex(/[a-z]/, '密码需包含小写字母')
      .regex(/[A-Z]/, '密码需包含大写字母')
      .regex(/[0-9]/, '密码需包含数字'),
    confirmPassword: z.string(),
    role: z.enum(['CLIENT', 'FREELANCER']).default('CLIENT'),
    // Clients only: picked from the company directory or added as new.
    companyName: z.string().trim().max(120, '公司名称最多 120 个字符').optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '两次输入的密码不一致',
    path: ['confirmPassword'],
  });

export type RegisterInput = z.infer<typeof registerSchema>;
