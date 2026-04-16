"use client";

import { useId, useState } from "react";

import { cn, fieldClass, inputClass, labelClass } from "@/lib/ui";

type PasswordFieldProps = {
  label: string;
  value: string;
  autoComplete?: string;
  onChange: (value: string) => void;
  id?: string;
  disabled?: boolean;
};

export function PasswordField({ label, value, autoComplete, onChange, id, disabled = false }: PasswordFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const [visible, setVisible] = useState(false);

  return (
    <div className={fieldClass}>
      <label className={labelClass} htmlFor={fieldId}>{label}</label>
      <div className="relative">
        <input
          id={fieldId}
          className={cn(inputClass, "pr-20")}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
        />
        <button
          type="button"
          className="absolute inset-y-1.5 right-1.5 inline-flex min-w-14 items-center justify-center rounded-none border border-slate-900/10 bg-slate-200/80 px-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-700 transition hover:border-indigo-600/20 hover:bg-slate-200 dark:border-white/10 dark:bg-slate-700/70 dark:text-slate-200 dark:hover:border-indigo-400/20 dark:hover:bg-slate-700"
          onClick={() => setVisible((current) => !current)}
          disabled={disabled}
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          aria-pressed={visible}
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
}