"use client";

import { useThemePreference } from "@/hooks/useThemePreference";
import { ledeClass, sectionTitleClass } from "@/lib/ui";
import type { ThemePreference } from "@/types";

const THEMES: { value: ThemePreference; label: string; description: string; icon: React.ReactNode }[] = [
  {
    value: "light",
    label: "Light",
    description: "Always use light mode",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="size-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
      </svg>
    ),
  },
  {
    value: "dark",
    label: "Dark",
    description: "Always use dark mode",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="size-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
      </svg>
    ),
  },
  {
    value: "system",
    label: "System",
    description: "Follow OS preference",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="size-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0H3" />
      </svg>
    ),
  },
];

export function ThemeSelectorDetail() {
  const { themePreference, saving, saveError, setThemePreference } = useThemePreference();

  return (
    <div className="flex flex-col gap-5">
      <h2 className={sectionTitleClass}>Color Theme</h2>
      <p className={ledeClass}>
        Choose how Sagent appears. System mode automatically matches your operating system preference.
      </p>

      <div className="flex flex-col gap-2" role="radiogroup" aria-label="Color theme">
        {THEMES.map((theme) => {
          const selected = themePreference === theme.value;
          return (
            <button
              key={theme.value}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={saving}
              onClick={() => setThemePreference(theme.value)}
              className={[
                "flex items-center gap-4 border px-4 py-3.5 text-left transition",
                selected
                  ? "border-indigo-600/30 bg-indigo-500/10 dark:border-indigo-400/30 dark:bg-indigo-400/12"
                  : "border-slate-900/10 bg-transparent hover:bg-slate-100/60 dark:border-white/10 dark:hover:bg-slate-700/30",
                saving ? "opacity-60" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <span className={selected ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500"}>
                {theme.icon}
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100">{theme.label}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{theme.description}</p>
              </div>
              {selected && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="size-4 flex-shrink-0 text-indigo-600 dark:text-indigo-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              )}
            </button>
          );
        })}
      </div>

      {saveError && (
        <p role="alert" className="rounded-none border border-red-600/25 bg-red-600/10 px-4 py-3 text-sm text-slate-900 dark:border-red-400/30 dark:bg-red-400/14 dark:text-zinc-100">
          {saveError}
        </p>
      )}
    </div>
  );
}
