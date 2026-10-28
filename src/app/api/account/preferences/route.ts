import { z } from 'zod';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { ok, fail, unauthorized, handle } from '@/lib/api';

const schema = z.object({
  name: z.string().trim().min(2, '名称至少 2 个字符').max(120, '名称最多 120 个字符').optional(),
  showFullName: z.boolean().optional(),
  indexProfile: z.boolean().optional(),
  notifyProposals: z.boolean().optional(),
  notifyMessages: z.boolean().optional(),
  notifyProductNews: z.boolean().optional(),
});

/** Account-level preferences shared by every role: display name and email prefs. */
export function POST(req: Request) {
  return handle(async () => {
    const session = await auth();
    if (!session?.user) return unauthorized();

    const body = schema.parse(await req.json());
    const data = Object.fromEntries(Object.entries(body).filter(([, v]) => v !== undefined));

    // The legal name is locked once the account is approved: it is what clients
    // contract with and what reviews are attached to, so it must not silently
    // change afterwards. Support can still correct it via the admin panel.
    if ('name' in data) {
      const me = await db.user.findUnique({
        where: { id: session.user.id },
        select: { approvedAt: true, name: true },
      });
      if (me?.approvedAt && me.name && me.name !== data.name) {
        return fail(
          'Your name is locked after approval. Contact support if it needs correcting.',
          422,
        );
      }
    }

    const user = await db.user.update({
      where: { id: session.user.id },
      data,
      select: {
        name: true,
        showFullName: true,
        indexProfile: true,
        notifyProposals: true,
        notifyMessages: true,
        notifyProductNews: true,
      },
    });

    return ok(user);
  });
}
