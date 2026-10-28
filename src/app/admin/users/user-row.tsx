'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  initials: string;
  role: string;
  status: string;
  approved: boolean;
  realName: string;
  identityStatus: string;
  companyName: string;
  headline: string;
  contactEmail: string;
  profileId: string | null;
  jobs: number;
  proposals: number;
};

export function UserRow({ user }: { user: AdminUser }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isShell = user.status === 'UNCLAIMED';
  const isFreelancer = ['FREELANCER', 'AGENCY_OWNER', 'AGENCY_MEMBER'].includes(user.role);

  async function patch(payload: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    setSaved(false);
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, ...payload }),
    });
    setBusy(false);
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error?.message ?? 'Could not save');
      return;
    }
    setSaved(true);
    router.refresh();
  }

  async function onSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await patch({
      name: String(form.get('name') ?? '').trim(),
      ...(isFreelancer
        ? { headline: String(form.get('headline') ?? '').trim() }
        : { companyName: String(form.get('companyName') ?? '').trim() }),
      ...(isShell ? { contactEmail: String(form.get('contactEmail') ?? '').trim() } : {}),
    });
  }

  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex flex-wrap items-center gap-3">
          <Avatar>
            {user.image ? <AvatarImage src={user.image} alt="" /> : null}
            <AvatarFallback>{user.initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{user.role.toLowerCase().replace('_', ' ')}</Badge>
              <Badge variant={user.status === 'ACTIVE' ? 'secondary' : 'outline'}>
                {user.status.toLowerCase()}
              </Badge>
              {!user.approved && !isShell ? (
                <Badge variant="outline" className="border-amber-500/50 text-amber-600">
                  unapproved
                </Badge>
              ) : null}
              <Badge variant={user.identityStatus === 'VERIFIED' ? 'secondary' : 'outline'}>
                实名：{user.identityStatus === 'VERIFIED' ? '已认证' : user.identityStatus === 'PENDING' ? '待审核' : '未认证'}
              </Badge>
            </div>
            {user.realName ? (
              <p className="mt-1 text-sm text-muted-foreground">真实姓名：{user.realName}</p>
            ) : null}
            <p className="mt-1 truncate font-medium">{user.name || '— no name —'}</p>
            <p className="truncate text-sm text-muted-foreground">
              {user.email}
              {user.contactEmail && user.contactEmail !== user.email
                ? ` · contact: ${user.contactEmail}`
                : ''}
              {user.jobs > 0 ? ` · ${user.jobs} posting(s)` : ''}
              {user.proposals > 0 ? ` · ${user.proposals} proposal(s)` : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!user.approved ? (
              <Button size="sm" disabled={busy} onClick={() => patch({ approved: true })}>
                Approve
              </Button>
            ) : null}
            {user.identityStatus === 'PENDING' ? (
              <Button size="sm" variant="outline" disabled={busy} onClick={() => patch({ identityVerified: true })}>
                通过实名
              </Button>
            ) : null}
            {user.identityStatus === 'VERIFIED' ? (
              <Button size="sm" variant="ghost" disabled={busy} onClick={() => patch({ identityVerified: false })}>
                撤销实名
              </Button>
            ) : null}
            <Button size="sm" variant="ghost" onClick={() => setOpen(!open)}>
              <ChevronDown className={open ? 'rotate-180 transition-transform' : 'transition-transform'} />
            </Button>
          </div>
        </div>

        {open ? (
          <form onSubmit={onSave} className="mt-4 grid gap-3 border-t pt-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor={`n-${user.id}`}>{isFreelancer ? 'Name' : 'Contact name'}</Label>
                <Input id={`n-${user.id}`} name="name" defaultValue={user.name} maxLength={120} />
              </div>
              {isFreelancer ? (
                <div className="grid gap-2">
                  <Label htmlFor={`h-${user.id}`}>Headline</Label>
                  <Input
                    id={`h-${user.id}`}
                    name="headline"
                    defaultValue={user.headline}
                    maxLength={120}
                  />
                </div>
              ) : (
                <div className="grid gap-2">
                  <Label htmlFor={`co-${user.id}`}>Company name</Label>
                  <Input
                    id={`co-${user.id}`}
                    name="companyName"
                    defaultValue={user.companyName}
                    maxLength={120}
                  />
                </div>
              )}
            </div>

            {isShell ? (
              <div className="grid gap-2">
                <Label htmlFor={`ce-${user.id}`}>Recruiter contact email</Label>
                <Input
                  id={`ce-${user.id}`}
                  name="contactEmail"
                  type="email"
                  defaultValue={user.contactEmail}
                  placeholder="jobs@company.com"
                />
                <p className="text-xs text-muted-foreground">
                  Where application notifications are sent. Setting this marks the company
                  contactable.
                </p>
              </div>
            ) : null}

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" size="sm" disabled={busy}>
                {busy ? 'Saving…' : 'Save'}
              </Button>
              {saved ? <span className="text-sm text-green-600">Saved ✓</span> : null}
              {user.profileId ? (
                <Button asChild size="sm" variant="ghost">
                  <Link href={`/freelancers/${user.profileId}`}>View profile</Link>
                </Button>
              ) : null}
              {user.status !== 'SUSPENDED' ? (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={() => patch({ status: 'SUSPENDED' })}
                >
                  Suspend
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={() => patch({ status: 'ACTIVE' })}
                >
                  Reinstate
                </Button>
              )}
            </div>
          </form>
        ) : null}
      </CardContent>
    </Card>
  );
}
