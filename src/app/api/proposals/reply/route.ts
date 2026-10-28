import { z } from 'zod';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { ok, fail, unauthorized, handle } from '@/lib/api';
import { notifyUser } from '@/lib/notify';

const schema = z.object({
  proposalId: z.string().cuid(),
  body: z.string().trim().min(1).max(5000),
});

/**
 * POST /api/proposals/reply — the job owner (client/recruiter) replies to an
 * applicant. Authorized by session + ownership of the proposal's job. Creates
 * or reuses the project-room conversation, posts the message, and notifies the
 * freelancer (which the worker emails as "company replied").
 */
export function POST(req: Request) {
  return handle(async () => {
    const session = await auth();
    if (!session?.user) return unauthorized();

    const { proposalId, body } = schema.parse(await req.json());

    const proposal = await db.proposal.findFirst({
      where: { id: proposalId, job: { clientId: session.user.id } },
      select: { id: true, freelancerId: true, job: { select: { id: true, title: true } } },
    });
    if (!proposal) return fail('未找到该投标人', 404);

    // Prefer the company name; fall back to the client's own name so the
    // freelancer sees who is actually contacting them, never a placeholder.
    const [company, me] = await Promise.all([
      db.clientProfile.findUnique({
        where: { userId: session.user.id },
        select: { companyName: true },
      }),
      db.user.findUnique({ where: { id: session.user.id }, select: { name: true } }),
    ]);
    const senderLabel = company?.companyName?.trim() || me?.name?.trim() || 'A client';

    const existing = await db.conversation.findFirst({
      where: {
        jobId: proposal.job.id,
        AND: [
          { participants: { some: { userId: session.user.id } } },
          { participants: { some: { userId: proposal.freelancerId } } },
        ],
      },
      select: { id: true },
    });

    const conversation =
      existing ??
      (await db.conversation.create({
        data: {
          jobId: proposal.job.id,
          title: proposal.job.title,
          participants: {
            create: [{ userId: session.user.id }, { userId: proposal.freelancerId }],
          },
        },
        select: { id: true },
      }));

    await db.message.create({
      data: { conversationId: conversation.id, senderId: session.user.id, body },
    });

    // "<Sender> · <Job>" so the email worker can split it for the dev template.
    // notifyUser sends the email immediately rather than waiting for the sweep.
    await notifyUser({
      userId: proposal.freelancerId,
      type: 'MESSAGE',
      title: `${senderLabel} · ${proposal.job.title}`,
      body: body.slice(0, 140),
      href: `/messages/${conversation.id}`,
    });

    return ok({ conversationId: conversation.id });
  });
}
