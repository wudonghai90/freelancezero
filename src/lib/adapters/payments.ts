/**
 * Payments adapter interface — the architectural embodiment of "zero fees".
 *
 * 自由工作平台 never custodies money. An adapter's job is only to (a) initiate
 * a direct client -> freelancer transfer using the chosen provider and (b)
 * report status back so the ledger (Payment rows) stays accurate. The platform
 * takes NO cut at any layer; there is deliberately no "application fee" concept
 * anywhere in these interfaces.
 *
 * Self-hosters pick a driver via the PAYMENTS_DRIVER env var. The `manual`
 * driver assumes payment happens off-platform (bank transfer, invoice) and just
 * records it — the truly zero-dependency default.
 */
import type { PaymentProvider } from '@prisma/client';

export interface FundMilestoneParams {
  milestoneId: string;
  amount: number; // minor units
  currency: string;
  clientId: string;
  freelancerId: string;
}

export interface PaymentResult {
  provider: PaymentProvider;
  providerRef?: string;
  status: 'ESCROW_FUNDED' | 'RELEASED' | 'FAILED';
}

export interface PaymentsAdapter {
  readonly provider: PaymentProvider;
  /** Hold/fund a milestone (real escrow, provider escrow, or a recorded intent). */
  fundMilestone(params: FundMilestoneParams): Promise<PaymentResult>;
  /** Release held funds to the freelancer. */
  releaseMilestone(milestoneId: string): Promise<PaymentResult>;
  /** Refund a funded-but-unreleased milestone back to the client. */
  refundMilestone(milestoneId: string): Promise<PaymentResult>;
}

/**
 * Default, dependency-free adapter: records the payment as happening
 * off-platform. Real Stripe Connect / PayPal adapters implement the same shape.
 */
export const manualPaymentsAdapter: PaymentsAdapter = {
  provider: 'MANUAL',
  async fundMilestone() {
    return { provider: 'MANUAL', status: 'ESCROW_FUNDED' };
  },
  async releaseMilestone() {
    return { provider: 'MANUAL', status: 'RELEASED' };
  },
  async refundMilestone() {
    return { provider: 'MANUAL', status: 'FAILED' };
  },
};

/**
 * 支付宝 / 微信支付：资金托管由持牌支付机构完成，平台只负责发起与查询。
 *
 * 当前实现是“记录托管意图”的适配层：真正扣款需要商户号、密钥、回调地址
 * 和支付产品（如支付宝“资金预授权”、微信“服务商分账”）。在凭证配齐前，
 * 调用会明确失败，而不是假装收款成功。
 */
function domesticAdapter(provider: 'ALIPAY' | 'WECHAT_PAY'): PaymentsAdapter {
  const configured =
    provider === 'ALIPAY'
      ? !!process.env.ALIPAY_APP_ID && !!process.env.ALIPAY_PRIVATE_KEY
      : !!process.env.WECHAT_MCH_ID && !!process.env.WECHAT_API_KEY;

  function ensure() {
    if (!configured) {
      throw new Error(
        provider === 'ALIPAY'
          ? '支付宝支付未配置：请设置 ALIPAY_APP_ID / ALIPAY_PRIVATE_KEY'
          : '微信支付未配置：请设置 WECHAT_MCH_ID / WECHAT_API_KEY',
      );
    }
  }

  return {
    provider,
    async fundMilestone() {
      ensure();
      throw new Error('支付下单接口尚未接入，请先使用 manual 模式记账');
    },
    async releaseMilestone() {
      ensure();
      throw new Error('资金释放接口尚未接入，请先使用 manual 模式记账');
    },
    async refundMilestone() {
      ensure();
      throw new Error('退款接口尚未接入，请先使用 manual 模式记账');
    },
  };
}

const alipayAdapter = domesticAdapter('ALIPAY');
const wechatAdapter = domesticAdapter('WECHAT_PAY');

/** Resolve the configured adapter. Extend the switch as adapters are added. */
export function getPaymentsAdapter(): PaymentsAdapter {
  switch (process.env.PAYMENTS_DRIVER) {
    case 'alipay':
      return alipayAdapter;
    case 'wechat':
      return wechatAdapter;
    // case 'stripe': return stripeConnectAdapter;
    // case 'paypal': return paypalAdapter;
    case 'manual':
    default:
      return manualPaymentsAdapter;
  }
}
