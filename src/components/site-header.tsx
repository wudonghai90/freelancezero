'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import {
  Zap, LayoutDashboard, Wallet, Settings, LogOut, Plus, ShieldCheck, MessageSquare, FileSignature,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { NotificationsBell } from '@/components/notifications-bell';
import { MessagesLink } from '@/components/messages-link';
import { Logo } from '@/components/logo';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

// Marketing nav for signed-out visitors.
const GUEST_NAV = [
  { href: '/jobs', label: '需求大厅' },
  { href: '/#how', label: '如何运作' },
  { href: '/#pricing', label: '平台规则' },
];

// Freelancer-side (also agency roles): they browse and apply to work.
const FREELANCER_NAV = [
  { href: '/jobs', label: '接单' },
  { href: '/dashboard', label: '工作台' },
  { href: '/contracts', label: '合同' },
];

// Client-side: they hire and manage their postings.
const CLIENT_NAV = [
  { href: '/jobs/new', label: '发布需求' },
  { href: '/dashboard', label: '工作台' },
  { href: '/contracts', label: '合同' },
];

const FREELANCER_ROLES = ['FREELANCER', 'AGENCY_OWNER', 'AGENCY_MEMBER'];

/** Two-letter initials from a name or email, for the avatar fallback. */
function initials(name?: string | null, email?: string | null): string {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    return (parts[0]![0]! + (parts[1]?.[0] ?? '')).toUpperCase();
  }
  return (email?.[0] ?? 'U').toUpperCase();
}

/** Premium top nav — role-aware, with an avatar account menu when signed in. */
export function SiteHeader() {
  const { data: session, status } = useSession();

  const user = session?.user;
  const isAuthed = status === 'authenticated' && !!user;
  const isFreelancer = isAuthed && FREELANCER_ROLES.includes(user!.role);
  const nav = !isAuthed ? GUEST_NAV : isFreelancer ? FREELANCER_NAV : CLIENT_NAV;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-20 items-center justify-between">
        <Link href="/" aria-label="自由工作平台首页">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-8 text-lg font-medium text-muted-foreground md:flex">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="transition-colors hover:text-foreground">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          {isAuthed ? <MessagesLink /> : null}
          {isAuthed ? <NotificationsBell /> : null}

          {isAuthed ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                className="ml-1 rounded-full outline-none ring-ring transition-shadow focus-visible:ring-2 focus-visible:ring-offset-2"
                aria-label="账号菜单"
              >
                <Avatar>
                  {user!.image ? <AvatarImage src={user!.image} alt="" /> : null}
                  <AvatarFallback>{initials(user!.name, user!.email)}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="flex flex-col">
                  <span className="truncate">{user!.name ?? '我的账号'}</span>
                  <span className="truncate text-xs font-normal text-muted-foreground">
                    {user!.email}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">
                    <LayoutDashboard /> 工作台
                  </Link>
                </DropdownMenuItem>
                {isFreelancer ? (
                  <DropdownMenuItem asChild>
                    <Link href="/jobs">
                      <Zap /> 接单
                    </Link>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem asChild>
                    <Link href="/jobs/new">
                      <Plus /> 发布需求
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/messages">
                    <MessageSquare /> 消息
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/contracts">
                    <FileSignature /> 合同
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings/payments">
                    <Wallet /> {isFreelancer ? '收款方式' : '付款方式'}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings /> 设置
                  </Link>
                </DropdownMenuItem>
                {user!.role === 'ADMIN' ? (
                  <DropdownMenuItem asChild>
                    <Link href="/admin/approvals">
                      <ShieldCheck /> 账号审核
                    </Link>
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => signOut({ callbackUrl: '/' })}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut /> 退出登录
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button asChild variant="ghost" size="default" className="hidden text-lg sm:inline-flex">
                <Link href="/login">登录</Link>
              </Button>
              <Button asChild size="default" className="text-lg shadow-sm">
                <Link href="/register">免费开始</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
