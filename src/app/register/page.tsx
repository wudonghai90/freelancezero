'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { registerSchema, type RegisterInput } from '@/lib/validations/auth';
import { CompanyCombobox } from '@/components/company-combobox';

type Role = 'CLIENT' | 'FREELANCER';

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const initialRole: Role = params.get('role') === 'freelancer' ? 'FREELANCER' : 'CLIENT';
  const [role, setRole] = useState<Role>(initialRole);
  const [serverError, setServerError] = useState<string | null>(null);
  const [company, setCompany] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema), mode: 'onBlur' });

  async function onSubmit(values: RegisterInput) {
    setServerError(null);
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...values,
        role,
        companyName: role === 'CLIENT' && company.trim() ? company.trim() : undefined,
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setServerError(body?.error?.message ?? '注册失败，请稍后重试');
      return;
    }

    // Auto sign-in, then straight into the required onboarding wizard
    // (profile photo, email confirmation, …).
    await signIn('credentials', {
      email: values.email,
      password: values.password,
      redirect: false,
    });
    router.push('/onboarding');
    router.refresh();
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">创建账号</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid grid-cols-2 gap-2">
          {(['CLIENT', 'FREELANCER'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={cn(
                'rounded-md border p-3 text-sm font-medium transition-colors',
                role === r ? 'border-primary bg-primary/10 text-primary' : 'hover:bg-accent',
              )}
            >
              {r === 'CLIENT' ? "我是委托方" : "我是服务方"}
            </button>
          ))}
        </div>

        {/* noValidate: inline field errors below replace browser tooltips. */}
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
          {role === 'CLIENT' ? (
            <Field id="company" label="公司名称（可选）">
              <CompanyCombobox id="company" value={company} onChange={setCompany} />
            </Field>
          ) : null}
          <div className="grid grid-cols-2 gap-3">
            <Field id="lastName" label="姓" error={errors.lastName?.message}>
              <Input
                id="lastName"
                autoComplete="family-name"
                aria-invalid={!!errors.lastName}
                className={cn(errors.lastName && 'border-destructive')}
                {...register('lastName')}
              />
            </Field>
            <Field id="firstName" label="名" error={errors.firstName?.message}>
              <Input
                id="firstName"
                autoComplete="given-name"
                aria-invalid={!!errors.firstName}
                className={cn(errors.firstName && 'border-destructive')}
                {...register('firstName')}
              />
            </Field>
          </div>
          <Field id="email" label="邮箱" error={errors.email?.message}>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              aria-invalid={!!errors.email}
              className={cn(errors.email && 'border-destructive')}
              {...register('email')}
            />
          </Field>
          <Field
            id="password"
            label="密码"
            error={errors.password?.message}
            hint="至少 8 位，包含大小写字母和数字。"
          >
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              aria-invalid={!!errors.password}
              className={cn(errors.password && 'border-destructive')}
              {...register('password')}
            />
          </Field>
          <Field id="confirmPassword" label="确认密码" error={errors.confirmPassword?.message}>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              aria-invalid={!!errors.confirmPassword}
              className={cn(errors.confirmPassword && 'border-destructive')}
              {...register('confirmPassword')}
            />
          </Field>
          <p className="text-xs text-muted-foreground">
            下一步上传头像并确认邮箱，大约一分钟。
          </p>
          {serverError ? <p className="text-sm text-destructive">{serverError}</p> : null}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? '创建中…' : '创建账号'}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          已有账号？{' '}
          <Link href="/login" className="text-primary hover:underline">
            登录
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

/** Label + input + inline error (or hint) — keeps the form fields uniform. */
function Field({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="container flex min-h-[70vh] items-center justify-center py-12">
      <Suspense>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
