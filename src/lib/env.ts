import { z } from 'zod';

/**
 * Validate environment variables once, at startup, and export a typed object.
 * Fail fast: a misconfigured deployment should crash on boot, not at runtime
 * deep inside a request handler.
 */
const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  DATABASE_URL: z.string().url(),
  AUTH_SECRET: z.string().min(1),

  // Optional providers — validated only for shape.
  AUTH_GOOGLE_ID: z.string().optional(),
  AUTH_GOOGLE_SECRET: z.string().optional(),
  AUTH_GITHUB_ID: z.string().optional(),
  AUTH_GITHUB_SECRET: z.string().optional(),

  EMAIL_SERVER_HOST: z.string().optional(),
  EMAIL_SERVER_PORT: z.coerce.number().optional(),
  EMAIL_FROM: z.string().optional(),
  // Production email provider. When set (and no EMAIL_SERVER_HOST), mail is sent
  // via Resend's SMTP relay. Requires a verified sending domain for EMAIL_FROM.
  RESEND_API_KEY: z.string().optional(),

  // --- External-job recruiter outreach ---
  // Whether to contact *guessed* recruiter addresses (role boxes / patterns) or
  // only ones the posting actually published. 'published_first' still discovers
  // and verifies guesses but uses them only as a fallback.
  RECRUITER_OUTREACH_POLICY: z
    .enum(['published_only', 'published_first'])
    .default('published_first'),
  // Live SMTP RCPT probing during verification. OFF by default: probing from the
  // app's IP harms sending reputation. When off we rely on MX + confidence.
  EMAIL_VERIFY_SMTP: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),
  // Minimum confidence for a *guessed* address to be marked contactable.
  RECRUITER_MIN_CONFIDENCE: z.coerce.number().min(0).max(1).default(0.7),
  // Shared secret guarding the /api/cron/* endpoints (Bearer token).
  CRON_SECRET: z.string().optional(),

  // Identity verification provider (KYC). 'manual' = 人工审核（国内默认）。
  IDENTITY_DRIVER: z.enum(['none', 'manual', 'stripe']).default('none'),

  STORAGE_DRIVER: z.enum(['local', 's3']).default('local'),
  REALTIME_DRIVER: z.enum(['socketio', 'pusher', 'none']).default('none'),
  SEARCH_DRIVER: z.enum(['postgres', 'meilisearch']).default('postgres'),
  PAYMENTS_DRIVER: z
    .enum(['manual', 'alipay', 'wechat', 'stripe', 'paypal'])
    .default('manual'),

  // 电子签：manual = 站内点击签署（记录姓名/时间/IP）；esign/fadada 预留。
  ESIGN_DRIVER: z.enum(['manual', 'esign', 'fadada']).default('manual'),

  // LLM registration pre-screen (OpenAI-compatible Chat Completions).
  // Without a key the review is skipped and the account stays in the human queue.
  AI_MODERATION_API_KEY: z.string().optional(),
  AI_MODERATION_BASE_URL: z.string().url().default('https://api.deepseek.com/v1'),
  AI_MODERATION_MODEL: z.string().default('deepseek-chat'),

  // 支付宝开放平台（PAYMENTS_DRIVER=alipay 时需要）
  ALIPAY_APP_ID: z.string().optional(),
  ALIPAY_PRIVATE_KEY: z.string().optional(),
  ALIPAY_PUBLIC_KEY: z.string().optional(),
  // 微信支付服务商/商户号（PAYMENTS_DRIVER=wechat 时需要）
  WECHAT_MCH_ID: z.string().optional(),
  WECHAT_API_KEY: z.string().optional(),
});

// On the client, only NEXT_PUBLIC_* vars exist; skip strict parsing there.
export const env =
  typeof window === 'undefined'
    ? schema.parse(process.env)
    : ({
        NODE_ENV: process.env.NODE_ENV,
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      } as unknown as z.infer<typeof schema>);
