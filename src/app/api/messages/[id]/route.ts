import { z } from 'zod';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { ok, fail, unauthorized, handle } from '@/lib/api';
import { notifyUser } from '@/lib/notify';
import { displayName } from '@/lib/utils';

const schema = z.object({ body: z.string().trim().min(1).max(5000) });

const FREELANCER_ROLES = ['FREELANCER', 'AGENCY_OWNER', 'AGENCY_MEMBER'];

/**
 * POST /api/messages/[id] — post a message to a conversation you belong to.
 * Notifies (and emails) every other participant.
 */
export function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const session = await auth();
    if (!session?.user) return unauthorized();
    const me = session.user.id;

    const { id } = await params;
    const { body } = schema.parse(await req.json());

    const conversation = await db.conversation.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        jobId: true,
        participants: { select: { userId: true } },
      },
    });
    if (!conversation) return fail('会话不存在', 404);
    if (!conversation.participants.some((p) => p.userId === me)) {
      return fail('会话不存在', 404);
    }

    await db.message.create({
      data: { conversationId: conversation.id, senderId: me, body },
    });
    // Keep the inbox ordered by latest activity.
    await db.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    // How the sender should appear to the recipient.
    const sender = await db.user.findUnique({
      where: { id: me },
      select: {
        name: true,
        role: true,
        showFullName: true,
        clientProfile: { select: { companyName: true } },
      },
    });
    const senderLabel = sender
      ? FREELANCER_ROLES.includes(sender.role)
        ? displayName(sender.name, sender.showFullName)
        : sender.clientProfile?.companyName?.trim() || sender.name?.trim() || 'A client'
      : 'Someone';

    const job = conversation.jobId
      ? await db.job.findUnique({ where: { id: conversation.jobId }, select: { title: true } })
      : null;
    const subjectContext = job?.title ?? conversation.title ?? 'your conversation';

    for (const p of conversation.participants) {
      if (p.userId === me) continue;
      await notifyUser({
        userId: p.userId,
        type: 'MESSAGE',
        title: `${senderLabel} · ${subjectContext}`,
        body: body.slice(0, 140),
        href: `/messages/${conversation.id}`,
      });
    }

    return ok({ sent: true });
  });
}
