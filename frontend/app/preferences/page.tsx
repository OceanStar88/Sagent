"use client";

import { AppShell } from "@/components/layout/AppShell";
import { useThemePreference } from "@/hooks/useThemePreference";
import type { ThemePreference } from "@/types";
import {
  cn,
  dangerAlertClass,
  eyebrowClass,
  ledeClass,
  nestedPanelClass,
  pageTitleClass,
  panelClass,
  sectionTitleClass,
  themeOptionBadgeClass,
  themeOptionClass,
  themeOptionToplineClass,
} from "@/lib/ui";


const THEME_OPTIONS: Array<{ value: ThemePreference; label: string; description: string }> = [
  { value: "light", label: "Light", description: "Use the crisp editor-inspired light workbench palette." },
  { value: "dark", label: "Dark", description: "Use the darker workbench palette inspired by VS Code." },
  { value: "system", label: "System", description: "Follow the device color scheme automatically." },
];

function ThemeIcon({ theme }: { theme: ThemePreference }) {
  if (theme === "light") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-[18px]">
        <circle cx="12" cy="12" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 2.5v3M12 18.5v3M21.5 12h-3M5.5 12h-3M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1M18.7 18.7l-2.1-2.1M7.4 7.4 5.3 5.3" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      </svg>
    );
  }

  if (theme === "dark") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-[18px]">
        <path d="M15.2 3.8a8.8 8.8 0 1 0 5 15.8 9.2 9.2 0 0 1-10.1-1.7A9.2 9.2 0 0 1 15.2 3.8Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-[18px]">
      <rect x="4" y="5" width="16" height="11" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9 19h6M12 16v3" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  );
}

export default function PreferencesPage() {
  const { themePreference, resolvedTheme, setThemePreference, saving, saveError } = useThemePreference();

  return (
    <AppShell>
      <section className={panelClass}>
        <div className="flex flex-col gap-3">
          <p className={eyebrowClass}>Account</p>
          <h1 className={pageTitleClass}>Preferences</h1>
          <p className={ledeClass}>Choose the VS Code 2026-inspired workbench palette for your account. Signed-in changes are saved and restored across sessions.</p>
        </div>
        {saveError ? <div className={dangerAlertClass}>{saveError}</div> : null}
        <article className={nestedPanelClass}>
          <div>
            <h2 className={sectionTitleClass}>Color theme</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Active theme: <span className="font-semibold capitalize text-slate-900 dark:text-zinc-100">{resolvedTheme}</span>
              {saving ? <span className="ml-2 text-indigo-700 dark:text-indigo-300">Saving...</span> : null}
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {THEME_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={themeOptionClass(themePreference === option.value)}
                onClick={() => setThemePreference(option.value)}
                disabled={saving}
              >
                <div className={themeOptionToplineClass}>
                  <span
                    className={cn(
                      "inline-flex size-[34px] items-center justify-center rounded-none border border-slate-900/10 bg-slate-100/90 dark:border-white/10 dark:bg-slate-700/65",
                      option.value === "light" && "text-indigo-700 dark:text-indigo-300",
                      option.value === "dark" && "text-blue-700 dark:text-blue-300",
                      option.value === "system" && "text-cyan-700 dark:text-cyan-300",
                    )}
                    aria-hidden="true"
                  >
                    <ThemeIcon theme={option.value} />
                  </span>
                  <strong>{option.label}</strong>
                  {themePreference === option.value ? <span className={themeOptionBadgeClass}>Selected</span> : null}
                </div>
                <span className="text-sm leading-6 text-slate-500 dark:text-slate-400">{option.description}</span>
              </button>
            ))}
          </div>
        </article>
      </section>
    </AppShell>
  );
}