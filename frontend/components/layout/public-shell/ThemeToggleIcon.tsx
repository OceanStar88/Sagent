import type { ThemePreference } from "@/types";

export function ThemeToggleIcon({ theme }: { theme: ThemePreference }) {
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