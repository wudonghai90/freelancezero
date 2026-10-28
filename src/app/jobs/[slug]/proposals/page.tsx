import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { formatMoney, initials, displayName } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ProposalReplyForm } from './proposals-reply-form';
import { HireButton } from './hire-button';

export const dynamic = 'force-dynamic';

/**
 * Job owner's proposals view. This is where the recruiter notification email
 * lands. Access is the normal session (login wall) — signing in with the
 * posting's email (magic link / Google / GitHub) claims the shell and unlocks
 * this page.
 */
export default async function JobProposalsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const session = await auth();
  if (!session?.user) redirect(`/login?next=/jobs/${slug}/proposals`);

  const job = await db.job.findUnique({
    where: { slug },
    select: {
      clientId: true,
      title: true,
      contract: { select: { id: true } },
      client: { select: { clientProfile: { select: { companyName: true } } } },
      proposals: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          status: true,
          coverLetter: true,
          bidAmount: true,
          bidType: true,
          freelancer: {
            select: {
              name: true,
              image: true,
              showFullName: true,
              freelancerProfile: { select: { id: true, headline: true, currency: true } },
            },
          },
        },
      },
    },
  });

  if (!job) notFound();
  // Only the posting's owner may see its applicants.
  if (job.clientId !== session.user.id) notFound();

  // Reduce applicant legal names to their public form before render.
  const proposals = job.proposals.map(({ freelancer, ...rest }) => ({
    ...rest,
    publicName: displayName(freelancer.name, freelancer.showFullName),
    avatarInitials: initials(freelancer.name),
    image: freelancer.image,
    profile: freelancer.freelancerProfile,
  }));

  const company = job.client.clientProfile?.companyName ?? 'Your company';

  return (
    <div className="container max-w-3xl py-12">
      <p className="text-sm text-muted-foreground">{company}</p>
      <h1 className="text-3xl font-bold">{job.title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">共 {proposals.length} 份投标</p>

      {job.contract ? (
        <p className="mt-4 text-sm">
          已生成合同：
          <Link href={`/contracts/${job.contract.id}`} className="text-primary hover:underline">
            查看合同
          </Link>
        </p>
      ) : null}

      {proposals.length === 0 ? (
        <Card className="mt-8">
          <CardContent className="py-8 text-center text-muted-foreground">还没有投标。</CardContent>
        </Card>
      ) : (
        <div className="mt-8 space-y-6">
          {proposals.map((p) => (
            <Card key={p.id}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Avatar>
                    {p.image ? <AvatarImage src={p.image} alt="" /> : null}
                    <AvatarFallback>{p.avatarInitials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-lg">
                      {p.profile ? (
                        <Link
                          href={`/freelancers/${p.profile.id}`}
                          className="hover:text-primary hover:underline"
                        >
                          {p.publicName}
                        </Link>
                      ) : (
                        p.publicName
                      )}
                    </CardTitle>
                    {p.profile?.headline ? (
                      <p className="truncate text-sm text-muted-foreground">{p.profile.headline}</p>
                    ) : null}
                  </div>
                  <Badge variant="outline">
                    {p.bidType === 'HOURLY'
                      ? `${formatMoney(p.bidAmount, p.profile?.currency ?? 'CNY', 'zh-CN')}/小时`
                      : formatMoney(p.bidAmount, p.profile?.currency ?? 'CNY', 'zh-CN')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                  {p.coverLetter}
                </p>
                {!job.contract && p.status !== 'REJECTED' && p.status !== 'WITHDRAWN' ? (
                  <HireButton proposalId={p.id} />
                ) : null}
                <ProposalReplyForm proposalId={p.id} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
