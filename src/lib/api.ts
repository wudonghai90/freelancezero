import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

/**
 * Small, consistent helpers for API route responses so every endpoint returns
 * the same JSON shape: `{ data }` on success, `{ error }` on failure.
 */

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ data }, { status: 200, ...init });
}

export function created<T>(data: T) {
  return NextResponse.json({ data }, { status: 201 });
}

export function fail(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ error: { message, details } }, { status });
}

export function unauthorized() {
  return fail('请先登录', 401);
}

export function forbidden(message = '没有权限执行此操作') {
  return fail(message, 403);
}

/**
 * Wrap a route handler so thrown ZodErrors become 422s and unexpected errors
 * become 500s — without leaking stack traces to clients.
 */
export function handle(fn: () => Promise<Response>): Promise<Response> {
  return fn().catch((err) => {
    if (err instanceof ZodError) {
      return fail('表单校验未通过', 422, err.flatten());
    }
    console.error('[api] unhandled error', err);
    return fail('服务器出错了，请稍后再试', 500);
  });
}
