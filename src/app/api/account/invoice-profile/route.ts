import { z } from 'zod';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { ok, unauthorized, handle } from '@/lib/api';

const schema = z.object({
  title: z.string().trim().min(2, '请填写发票抬头').max(100),
  taxNumber: z.string().trim().max(40).optional().or(z.literal('')),
  type: z.enum(['NORMAL', 'VAT_SPECIAL']).default('NORMAL'),
  email: z.string().trim().email().optional().or(z.literal('')),
  bankName: z.string().trim().max(100).optional().or(z.literal('')),
  bankAccount: z.string().trim().max(60).optional().or(z.literal('')),
  registeredAddress: z.string().trim().max(200).optional().or(z.literal('')),
  registeredPhone: z.string().trim().max(40).optional().or(z.literal('')),
});

/** GET /api/account/invoice-profile — 当前用户的默认开票信息。 */
export function GET() {
  return handle(async () => {
    const session = await auth();
    if (!session?.user) return unauthorized();
    const profile = await db.invoiceProfile.findUnique({
      where: { userId: session.user.id },
    });
    return ok(profile);
  });
}

/** POST /api/account/invoice-profile — 新建或更新默认开票信息。 */
export function POST(req: Request) {
  return handle(async () => {
    const session = await auth();
    if (!session?.user) return unauthorized();

    const input = schema.parse(await req.json());
    const data = {
      title: input.title,
      taxNumber: input.taxNumber || null,
      type: input.type,
      email: input.email || null,
      bankName: input.bankName || null,
      bankAccount: input.bankAccount || null,
      registeredAddress: input.registeredAddress || null,
      registeredPhone: input.registeredPhone || null,
    };

    const profile = await db.invoiceProfile.upsert({
      where: { userId: session.user.id },
      create: { userId: session.user.id, ...data },
      update: data,
    });
    return ok(profile);
  });
}
