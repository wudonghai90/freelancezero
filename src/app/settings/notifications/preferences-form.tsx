'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';

type Prefs = {
  showFullName: boolean;
  indexProfile: boolean;
  notifyProposals: boolean;
  notifyMessages: boolean;
  notifyProductNews: boolean;
};

/** Toggle row that saves immediately — no save button to forget. */
function Toggle({
  label,
  desc,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 border-b py-4 last:border-0">
      <span className="min-w-0">
        <span className="block font-medium">{label}</span>
        <span className="block text-sm text-muted-foreground">{desc}</span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 size-5 shrink-0 cursor-pointer accent-primary"
      />
    </label>
  );
}

export function PreferencesForm({
  initial,
  exampleName,
}: {
  initial: Prefs;
  exampleName: string;
}) {
  const router = useRouter();
  const [prefs, setPrefs] = useState<Prefs>(initial);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function set(key: keyof Prefs, value: boolean) {
    const previous = prefs;
    setPrefs({ ...prefs, [key]: value }); // optimistic
    setError(null);
    setSaved(false);

    const res = await fetch('/api/account/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [key]: value }),
    });

    if (!res.ok) {
      setPrefs(previous); // roll back
      setError('保存失败，请稍后再试。');
      return;
    }
    setSaved(true);
    router.refresh();
  }

  // Preview of how the public name renders with the current setting.
  const parts = exampleName.trim().split(/\s+/);
  const abbreviated =
    parts.length > 1
      ? `${parts.slice(0, -1).join(' ')} ${parts[parts.length - 1]![0]!.toUpperCase()}.`
      : exampleName;

  return (
    <div>
      <section>
        <h2 className="text-lg font-semibold">隐私</h2>
        <div className="mt-2">
          <Toggle
            label="公开显示我的全名"
            desc={
              prefs.showFullName
                ? `你的主页显示为「${exampleName}」。`
                : `你的主页显示为「${abbreviated}」。开启后将显示全名。`
            }
            checked={prefs.showFullName}
            onChange={(v) => set('showFullName', v)}
          />
          <Toggle
            label="允许搜索引擎收录我的主页"
            desc={
              prefs.indexProfile
                ? '你的主页可能出现在搜索结果中，带来自然流量。关闭后仅站内客户可见。'
                : '你的主页不会出现在搜索引擎中，站内客户仍可搜索和查看。'
            }
            checked={prefs.indexProfile}
            onChange={(v) => set('indexProfile', v)}
          />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">邮件通知</h2>
        <div className="mt-2">
          <Toggle
            label="投标与申请"
            desc="有人投标你的需求，或你的投标状态发生变化时。"
            checked={prefs.notifyProposals}
            onChange={(v) => set('notifyProposals', v)}
          />
          <Toggle
            label="站内消息"
            desc="客户或服务方给你发送消息时。"
            checked={prefs.notifyMessages}
            onChange={(v) => set('notifyMessages', v)}
          />
          <Toggle
            label="产品动态"
            desc="偶尔发送新功能介绍，每月不超过一次。"
            checked={prefs.notifyProductNews}
            onChange={(v) => set('notifyProductNews', v)}
          />
          <Toggle
            label="安全与账号邮件"
            desc="邮箱验证、密码与收款方式变更。为保障账号安全，始终开启。"
            checked
            disabled
            onChange={() => {}}
          />
        </div>
      </section>

      <div className="mt-4 h-5">
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {saved && !error ? (
          <p className="inline-flex items-center gap-1 text-sm text-green-600">
            <Check className="size-4" /> 已保存
          </p>
        ) : null}
      </div>
    </div>
  );
}
