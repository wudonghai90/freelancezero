'use client';

import { useEffect, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';

/**
 * Searchable company picker for client registration. Queries /api/companies
 * as the user types; a company not in the directory is offered as "Add new"
 * and created on registration.
 */
export function CompanyCombobox({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  const boxRef = useRef<HTMLDivElement>(null);

  // Debounced typeahead.
  useEffect(() => {
    const q = value.trim();
    if (q.length < 2) {
      setOptions([]);
      return;
    }
    const t = setTimeout(async () => {
      const res = await fetch(`/api/companies?q=${encodeURIComponent(q)}`);
      if (res.ok) setOptions(((await res.json()).data?.items ?? []) as string[]);
    }, 250);
    return () => clearTimeout(t);
  }, [value]);

  // Close on outside click.
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const trimmed = value.trim();
  const showAdd = trimmed.length >= 2 && !options.some((o) => o.toLowerCase() === trimmed.toLowerCase());

  return (
    <div ref={boxRef} className="relative">
      <Input
        id={id}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        autoComplete="organization"
        placeholder="输入公司名称"
      />
      {open && (options.length > 0 || showAdd) ? (
        <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-md border bg-card p-1 shadow-md">
          {options.map((name) => (
            <li key={name}>
              <button
                type="button"
                className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
                onClick={() => {
                  onChange(name);
                  setOpen(false);
                }}
              >
                {name}
              </button>
            </li>
          ))}
          {showAdd ? (
            <li>
              <button
                type="button"
                className="flex w-full items-center gap-1.5 rounded-sm px-2 py-1.5 text-left text-sm text-primary hover:bg-accent"
                onClick={() => setOpen(false)}
              >
                <Plus className="size-3.5" /> Add “{trimmed}” as a new company
              </button>
            </li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}
