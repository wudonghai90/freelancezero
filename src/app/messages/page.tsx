import Link from 'next/link';
import { redirect } from 'next/navigation';
import { MessageSquare } from 'lucide-react';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { initials, displayName } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { PollRefresh } from '@/components/poll-refresh';
import { getRealtime } from '@/lib/adapters/realtime';

export const metadata = { title: '消息' };
export const dynamic = 'force-dynamic';

const FREELANCER_ROLES = ['FREELANCER', 'AGENCY_OWNER', 'AGENCY_MEMBER'];

export default async function MessagesPage() {
  const session = await auth();
  if (!session?.user) redirect('/login?next=/messages');
  const me = session.user.id;

  const conversations = await db.conversation.findMany({
    where: { participants: { some: { userId: me } } },
    orderBy: { updatedAt: 'desc' },
    take: 50,
    select: {
      id: true,
      title: true,
      updatedAt: true,
      participants: {
        select: {
          userId: true,
          user: {
            select: {
              name: true,
              image: true,
              showFullName: true,
              role: true,
              clientProfile: { select: { companyName: true } },
            },
          },
        },
      },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { body: true, createdAt: true },
      },
    },
  });

  // Reduce to a render-safe shape (no legal names in the payload).
  const threads = conversations.map((c) => {
    const other = c.participants.find((p) => p.userId !== me);
    const label = !other
      ? '会话'
      : FREELANCER_ROLES.includes(other.user.role)
        ? displayName(other.user.name, other.user.showFullName)
        : other.user.clientProfile?.companyName?.trim() || other.user.name?.trim() || '客户';
    return {
      id: c.id,
      title: c.title,
      label,
      image: other?.user.image ?? null,
      avatarInitials: initials(label),
      preview: c.messages[0]?.body ?? null,
      at: c.messages[0]?.createdAt ?? c.updatedAt,
    };
  });

  return (
    <div className="container max-w-3xl py-12">
      {/* Inbox is glanced at, not stared at — the slower cadence is enough. */}
      <PollRefresh intervalMs={getRealtime().poll.notifications} />

      <div className="mb-8 flex items-center gap-3">
        <MessageSquare className="size-6 text-primary" />
        <h1 className="text-3xl font-bold">消息</h1>
      </div>

      {threads.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            还没有会话。客户回复投标后，会话会出现在这里。
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {threads.map((t) => (
            <Link key={t.id} href={`/messages/${t.id}`} className="block">
              <Card className="transition-colors hover:border-primary">
                <CardContent className="flex items-center gap-3 py-4">
                  <Avatar>
                    {t.image ? <AvatarImage src={t.image} alt="" /> : null}
                    <AvatarFallback>{t.avatarInitials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="truncate font-medium">{t.label}</p>
                      <span className="whitespace-nowrap text-xs text-muted-foreground">
                        {t.at.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    {t.title ? (
                      <p className="truncate text-xs text-muted-foreground">{t.title}</p>
                    ) : null}
                    {t.preview ? (
                      <p className="truncate text-sm text-muted-foreground">{t.preview}</p>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
