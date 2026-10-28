import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AvatarUpload } from '@/components/avatar-upload';
import { ProfileForm } from './profile-form';
import { CompanyForm } from './company-form';

export const metadata = { title: '公开主页' };
export const dynamic = 'force-dynamic';

const FREELANCER_ROLES = ['FREELANCER', 'AGENCY_OWNER', 'AGENCY_MEMBER'];

export default async function ProfileSettingsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login?next=/settings/profile');
  const isFreelancer = FREELANCER_ROLES.includes(session.user.role);

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      image: true,
      approvedAt: true,
      freelancerProfile: {
        select: {
          id: true,
          headline: true,
          bio: true,
          hourlyRate: true,
          location: true,
          timezone: true,
          yearsExperience: true,
          websiteUrl: true,
          githubUrl: true,
          linkedinUrl: true,
          dribbbleUrl: true,
          behanceUrl: true,
          stackoverflowUrl: true,
          xUrl: true,
          availability: true,
          hoursPerWeek: true,
        },
      },
      clientProfile: {
        select: { companyName: true, companyUrl: true, about: true, location: true },
      },
    },
  });
  if (!user) redirect('/login');

  const p = user.freelancerProfile;
  const c = user.clientProfile;

  return (
    <div className="container max-w-2xl py-12">
      <Button asChild variant="ghost" size="sm" className="mb-6">
        <Link href="/settings">
          <ArrowLeft /> 设置
        </Link>
      </Button>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">{isFreelancer ? '公开主页' : '你的信息'}</h1>
        {isFreelancer && p?.id ? (
          <Button asChild variant="outline" size="sm">
            {/* Opens in a new tab so editing is not interrupted. */}
            <a href={`/freelancers/${p.id}`} target="_blank" rel="noopener noreferrer">
              查看公开主页 <ExternalLink />
            </a>
          </Button>
        ) : null}
      </div>
      <p className="mt-1 mb-8 text-muted-foreground">
        {isFreelancer
          ? '客户找到你时看到的就是这些信息。'
          : '服务方在需求和消息中看到的就是这些信息。'}
      </p>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>头像</CardTitle>
        </CardHeader>
        <CardContent>
          <AvatarUpload image={user.image} name={user.name} email={user.email} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>详细资料</CardTitle>
        </CardHeader>
        <CardContent>
          {isFreelancer ? (
            <ProfileForm
              initial={{
                name: user.name ?? '',
                // The legal name is what clients contract with, so it freezes
                // once the account is approved (admins can still correct it).
                nameLocked: !!user.approvedAt && !!user.name,
                headline: p?.headline ?? '',
                bio: p?.bio ?? '',
                hourlyRate: p?.hourlyRate ?? null,
                location: p?.location ?? '',
                timezone: p?.timezone ?? '',
                yearsExperience: p?.yearsExperience ?? null,
                availability: p?.availability ?? 'OPEN_TO_OFFERS',
                hoursPerWeek: p?.hoursPerWeek ?? null,
                websiteUrl: p?.websiteUrl ?? '',
                githubUrl: p?.githubUrl ?? '',
                linkedinUrl: p?.linkedinUrl ?? '',
                dribbbleUrl: p?.dribbbleUrl ?? '',
                behanceUrl: p?.behanceUrl ?? '',
                stackoverflowUrl: p?.stackoverflowUrl ?? '',
                xUrl: p?.xUrl ?? '',
              }}
            />
          ) : (
            <CompanyForm
              initial={{
                name: user.name ?? '',
                companyName: c?.companyName ?? '',
                companyUrl: c?.companyUrl ?? '',
                about: c?.about ?? '',
                location: c?.location ?? '',
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
