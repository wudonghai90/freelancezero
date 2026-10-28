/**
 * 电子签适配层。
 *
 * 默认 `manual`：站内点击签署，记录签署人真实姓名、时间、IP 与 UA，作为
 * 双方同意的证据。生产环境应接入 e签宝 / 法大大 等具备 CA 资质的服务，
 * 由对方完成实名、意愿认证并出具带时间戳的签署文件。
 */
export type EsignDriver = 'manual' | 'esign' | 'fadada';

export interface SignParams {
  contractId: string;
  userId: string;
  party: 'CLIENT' | 'FREELANCER';
  signerName: string;
  ip?: string;
  userAgent?: string;
}

export interface SignResult {
  provider: string;
  status: 'SIGNED' | 'PENDING';
  /** 第三方流程引用，便于追溯。 */
  ref?: string;
  /** 需要跳转到的第三方签署页。 */
  signUrl?: string;
}

export interface EsignAdapter {
  readonly driver: EsignDriver;
  readonly configured: boolean;
  sign(params: SignParams): Promise<SignResult>;
}

const manualAdapter: EsignAdapter = {
  driver: 'manual',
  configured: true,
  async sign() {
    return { provider: 'manual', status: 'SIGNED' };
  },
};

function notConfigured(driver: EsignDriver): EsignAdapter {
  return {
    driver,
    configured: false,
    async sign() {
      throw new Error(
        driver === 'esign'
          ? 'e签宝未配置：请设置 ESIGN_APP_ID / ESIGN_APP_SECRET'
          : '法大大未配置：请设置 FADADA_APP_ID / FADADA_APP_SECRET',
      );
    },
  };
}

export function getEsignAdapter(): EsignAdapter {
  switch (process.env.ESIGN_DRIVER) {
    case 'esign':
      return notConfigured('esign');
    case 'fadada':
      return notConfigured('fadada');
    default:
      return manualAdapter;
  }
}
