import Link from 'next/link';
import { after } from 'next/server';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';
import { db } from '@/lib/db';
import { runAutoReview } from '@/lib/ai/moderation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = { title: '验证邮箱' };
export const dynamic = 'force-dynamic';

/** Email-confirmation landing page. Consumes the one-time token. */
export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; email?: string }>;
}) {
  const { token, email } = await searchParams;

  let state: 'success' | 'expired' | 'invalid' = 'invalid';
  if (token && email) {
    const record = await db.verificationToken.findUnique({ where: { token } });
    if (record && record.identifier === email) {
      if (record.expires > new Date()) {
        const user = await db.user.findUnique({ where: { email }, select: { id: true } });
        await db.user.updateMany({ where: { email }, data: { emailVerified: new Date() } });
        // One-time: burn every outstanding token for this address.
        await db.verificationToken.deleteMany({ where: { identifier: email } });
        if (user) {
          after(() =>
            runAutoReview(user.id).catch((err) => console.error('[ai-moderation]', err)),
          );
        }
        state = 'success';
      } else {
        state = 'expired';
      }
    }
  }

  const content = {
    success: {
      icon: <CheckCircle2 className="size-10 text-primary" />,
      title: '邮箱验证成功',
      body: '你的邮箱已验证，可以在工作台完成剩余设置。',
      cta: { href: '/dashboard', label: '进入工作台' },
    },
    expired: {
      icon: <Clock className="size-10 text-amber-600" />,
      title: '链接已过期',
      body: '验证链接 24 小时后失效，请登录后在工作台重新获取。',
      cta: { href: '/login', label: '登录' },
    },
    invalid: {
      icon: <XCircle className="size-10 text-destructive" />,
      title: '链接无效',
      body: '该验证链接无效或已被使用。',
      cta: { href: '/login', label: '登录' },
    },
  }[state];

  return (
    <div className="container flex min-h-[70vh] items-center justify-center py-12">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="items-center gap-3">
          {content.icon}
          <CardTitle className="text-2xl">{content.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{content.body}</p>
          <Button asChild className="mt-6">
            <Link href={content.cta.href}>{content.cta.label}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
