import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Stepper } from '@/components/stepper';
import { ResendVerificationButton } from './resend-verification-button';
import type { OnboardingStep } from '@/lib/onboarding';

/**
 * Dashboard checklist mirroring the /onboarding wizard's progress. Stays
 * visible until the final step (admin approval) is done; steps are defined in
 * lib/onboarding.ts.
 */
export function OnboardingSteps({
  steps,
  currentIndex,
}: {
  steps: OnboardingStep[];
  currentIndex: number;
}) {
  if (currentIndex === -1) return null;

  const current = steps[currentIndex];
  const doneCount = steps.filter((s) => s.done).length;

  return (
    <Card className="mb-8">
      <CardContent className="py-5">
        <div className="mb-4 flex items-center justify-between gap-4">
          <p className="font-medium">完成账号设置</p>
          <p className="text-sm text-muted-foreground">
            已完成 {doneCount}/{steps.length}
          </p>
        </div>

        <Stepper steps={steps} currentIndex={currentIndex} />

        <p className="mt-4 text-center text-sm text-muted-foreground">
          {current?.id === 'email' ? (
            <>
              请查收邮箱中的验证链接。<ResendVerificationButton />
            </>
          ) : current?.id === 'approval' ? (
            '资料已提交，等待管理员审核，通常一天内完成。'
          ) : (
            <>
              下一步：{' '}
              <Link href="/onboarding" className="font-medium text-primary hover:underline">
                继续完善
              </Link>
            </>
          )}
        </p>
      </CardContent>
    </Card>
  );
}
