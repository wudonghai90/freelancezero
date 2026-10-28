import { db } from '@/lib/db';

/**
 * The single definition of the onboarding flow. Both the /onboarding wizard
 * and the dashboard checklist derive from this — adding a step here (plus a
 * step component in the wizard) extends the flow everywhere.
 *
 * Progress is *derived from the database* (no separate wizard state), so the
 * flow is inherently resumable: closing the tab loses nothing.
 */
export type OnboardingStepId = 'account' | 'email' | 'photo' | 'profile' | 'payout' | 'approval';

export type OnboardingStep = {
  id: OnboardingStepId;
  label: string;
  done: boolean;
};

const FREELANCER_ROLES = ['FREELANCER', 'AGENCY_OWNER', 'AGENCY_MEMBER'];

export type OnboardingUser = {
  email: string | null;
  emailVerified: Date | null;
  image: string | null;
  approvedAt: Date | null;
  payoutProvider: string | null;
  payoutDetail: string | null;
  payoutHolderName: string | null;
  freelancerProfile: {
    headline: string | null;
    hourlyRate: number | null;
    location: string | null;
  } | null;
};

export async function getOnboarding(userId: string, role: string) {
  const user = (await db.user.findUnique({
    where: { id: userId },
    select: {
      email: true,
      emailVerified: true,
      image: true,
      approvedAt: true,
      payoutProvider: true,
      payoutDetail: true,
      payoutHolderName: true,
      freelancerProfile: { select: { headline: true, hourlyRate: true, location: true } },
    },
  })) as OnboardingUser | null;

  const isFreelancer = FREELANCER_ROLES.includes(role);
  const steps: OnboardingStep[] = [
    { id: 'account', label: '创建账号', done: true },
    { id: 'email', label: '验证邮箱', done: !!user?.emailVerified },
    { id: 'photo', label: '上传头像', done: !!user?.image },
    isFreelancer
      ? {
          id: 'profile',
          label: '基本资料',
          // Location is required: clients filter on it, so an incomplete profile
          // is invisible to exactly the people meant to find it.
          done: !!user?.freelancerProfile?.headline && !!user?.freelancerProfile?.location,
        }
      : { id: 'payout', label: '添加付款方式', done: !!user?.payoutProvider },
    { id: 'approval', label: '审核通过', done: !!user?.approvedAt },
  ];

  // Approval is the terminal gate, not just another checkbox: a human has
  // reviewed and vouched for the account. If it was granted early (an admin can
  // approve straight from the admin panel), the earlier prompts are moot —
  // continuing to block someone an admin already cleared is nonsense, and it is
  // what produced a "complete" approval step sitting after unfinished ones.
  const approved = !!user?.approvedAt;

  const currentIndex = approved ? -1 : steps.findIndex((s) => !s.done);
  return {
    steps,
    user,
    isFreelancer,
    currentIndex,
    /** Every self-serve step done — only the (async) admin review is left. */
    actionableComplete: approved || steps.slice(0, -1).every((s) => s.done),
    complete: approved || currentIndex === -1,
  };
}

/**
 * Where a signed-in user should land instead of a public page (login/register,
 * middleware home redirect). Onboarding gates the app: incomplete users go
 * back to the wizard; finished users get their role home — the job feed for
 * freelancers, the dashboard for everyone else. Admins bypass the wizard.
 */
export async function getSignedInDestination(userId: string, role: string): Promise<string> {
  if (role !== 'ADMIN') {
    const state = await getOnboarding(userId, role);
    if (!state.complete) return '/onboarding';
  }
  return FREELANCER_ROLES.includes(role) ? '/jobs' : '/dashboard';
}
