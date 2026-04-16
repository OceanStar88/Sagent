"use client";

import { useThemePreference } from "@/hooks/useThemePreference";
import { cn } from "@/lib/ui";

import { ThemeToggleIcon } from "@/components/layout/public-shell/ThemeToggleIcon";

export function ThemeToggleButton() {
  const { themePreference, cycleThemePreference } = useThemePreference();

  return (
    <button
      type="button"
      className={cn(
        "inline-flex size-11 items-center justify-center rounded-none border border-slate-900/10 bg-slate-200/80 text-slate-900 transition hover:-translate-y-px hover:border-indigo-600/20 hover:bg-slate-200 dark:border-white/10 dark:bg-slate-700/70 dark:text-zinc-100 dark:hover:border-indigo-400/20 dark:hover:bg-slate-700",
        themePreference === "light" && "text-indigo-700 dark:text-indigo-300",
        themePreference === "dark" && "text-blue-700 dark:text-blue-300",
        themePreference === "system" && "text-cyan-700 dark:text-cyan-300",
      )}
      onClick={cycleThemePreference}
      aria-label={`Theme is ${themePreference}. Click to cycle theme.`}
      title={`Theme: ${themePreference}`}
    >
      <ThemeToggleIcon theme={themePreference} />
      <span className="sr-only">Theme: {themePreference}</span>
    </button>
  );
}