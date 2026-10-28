import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { JobForm } from './job-form';

export const metadata = { title: '发布需求 — OPC' };
export const dynamic = 'force-dynamic';

const CLIENT_ROLES = ['CLIENT', 'AGENCY_OWNER', 'ADMIN'];

/** Post-a-job page. Clients only, and only once their account is approved. */
export default async function NewJobPage() {
  const session = await auth();
  if (!session?.user) redirect('/login?next=/jobs/new');

  const canPost = CLIENT_ROLES.includes(session.user.role);

  if (canPost && session.user.role !== 'ADMIN') {
    const me = await db.user.findUnique({
      where: { id: session.user.id },
      select: { approvedAt: true },
    });
    if (!me?.approvedAt) redirect('/onboarding');
  }

  return (
    <div className="container max-w-2xl py-12">
      <h1 className="text-3xl font-bold">发布需求</h1>
      <p className="mt-1 mb-8 text-muted-foreground">
        直接触达服务方。平台不抽佣，按里程碑验收付款。
      </p>

      {canPost ? (
        <JobForm />
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <p className="text-muted-foreground">当前是服务方账号，无法发布需求。</p>
            <Button asChild>
              <Link href="/jobs">去需求大厅</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
