import { z } from 'zod';
import { auth } from '@/lib/auth';
import { ok, forbidden, handle } from '@/lib/api';
import { approveAccount } from '@/lib/approvals';

const schema = z.object({ userId: z.string().cuid() });

/**
 * POST /api/admin/approvals — approve an account (the final onboarding gate).
 * The user is notified in-app and by confirmation email.
 */
export function POST(req: Request) {
  return handle(async () => {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') return forbidden();

    const { userId } = schema.parse(await req.json());
    await approveAccount(userId, { source: 'admin', approvedBy: session.user.id });

    return ok({ userId });
  });
}
