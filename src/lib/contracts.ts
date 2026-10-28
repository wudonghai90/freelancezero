import { formatMoney } from '@/lib/utils';

type MilestoneInput = { title: string; amount: number; dueInDays: number | null };

/**
 * 生成合同正文。这里刻意保持为纯文本：双方签署前可完整阅读，后续可以直接
 * 替换成模板引擎或第三方电子签的模板 ID。
 */
export function buildContractContent(params: {
  clientLabel: string;
  freelancerLabel: string;
  jobTitle: string;
  budgetType: 'FIXED' | 'HOURLY';
  currency: string;
  estimatedDays: number | null;
  total: number;
  milestones: MilestoneInput[];
}) {
  const {
    clientLabel,
    freelancerLabel,
    jobTitle,
    budgetType,
    currency,
    estimatedDays,
    total,
    milestones,
  } = params;

  const scope = `项目名称：${jobTitle}
合作方式：${budgetType === 'FIXED' ? '固定总价' : '按小时计费'}
合同金额：${formatMoney(total, currency, 'zh-CN')}${budgetType === 'HOURLY' ? '（按实际工时结算）' : ''}
预计工期：${estimatedDays ? `${estimatedDays} 天` : '以里程碑约定为准'}`;

  const list = milestones
    .map(
      (m, i) =>
        `${i + 1}. ${m.title} — ${formatMoney(m.amount, currency, 'zh-CN')}${
          m.dueInDays ? `（${m.dueInDays} 天内）` : ''
        }`,
    )
    .join('\n');

  return `项目服务合同

甲方（委托方）：${clientLabel}
乙方（服务方）：${freelancerLabel}

${scope}

一、里程碑与付款
${list}

二、交付与验收
1. 乙方按里程碑提交可运行的成果、源码或文档。
2. 甲方应在收到交付物后 5 个工作日内验收并反馈；逾期未提出书面异议视为验收通过。
3. 验收通过后释放对应里程碑款项。资金通过平台选定的支付渠道结算。

三、知识产权
项目款项结清后，为本项目专门产生的交付成果归甲方所有；乙方保留其通用组件、工具与既有技术的权利。

四、保密
双方对项目中获知的商业秘密与技术资料负有保密义务，法律法规另有规定的除外。

五、违约责任
任一方无故中止合作，应赔偿对方已发生的直接损失；因不可抗力导致的延期，双方协商顺延。

六、争议解决
争议优先由平台协调；协商不成的，提交甲方所在地有管辖权的人民法院处理。

七、生效
双方在平台完成电子签署后本合同生效。签署记录（姓名、时间、IP）与本合同正文共同构成合同文件。`;
}

export const CONTRACT_STATUS_LABEL: Record<string, string> = {
  ACTIVE: '履约中',
  PAUSED: '已暂停',
  COMPLETED: '已完成',
  CANCELLED: '已取消',
  DISPUTED: '争议中',
};

export const MILESTONE_STATUS_LABEL: Record<string, string> = {
  PENDING: '待托管',
  FUNDED: '已托管',
  SUBMITTED: '待验收',
  APPROVED: '待放款',
  RELEASED: '已结算',
  DISPUTED: '争议中',
};

export const INVOICE_STATUS_LABEL: Record<string, string> = {
  REQUESTED: '待开票',
  PROCESSING: '开票中',
  ISSUED: '已开票',
  CANCELLED: '已取消',
};