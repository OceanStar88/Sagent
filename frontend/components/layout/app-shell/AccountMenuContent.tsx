import Link from "next/link";

import type { AuthUser } from "@/types";

import { ACCOUNT_ITEMS } from "./nav";
import { accountMenuItemClass, accountNavItemClass } from "./styles";

export function AccountMenuContent({
  user,
  variant,
  isAccountRoute,
  onNavigate,
  onSignOut,
}: {
  user: AuthUser | null;
  variant?: "desktop" | "mobile" | "default";
  isAccountRoute: (href: string) => boolean;
  onNavigate: (href: string) => void;
  onSignOut: () => void;
}) {
  const accountLabel = user?.display_name ?? "Admin User";
  const email = user?.email ?? "admin@sagent.local";
  const useNavStyle = variant === "desktop" || variant === "mobile";
  const isMobile = variant === "mobile";
  const itemLabelClass = useNavStyle ? "max-w-full whitespace-normal break-words text-center text-[0.8rem] font-medium leading-[1.1]" : undefined;

  return (
    <>
      {useNavStyle ? null : (
        <div className="grid gap-0.5 pb-2 pt-1.5">
          <strong className="truncate text-[0.9rem] text-slate-900 dark:text-zinc-100">{accountLabel}</strong>
          <span className="truncate text-[0.77rem] text-slate-500 dark:text-slate-400">{email}</span>
        </div>
      )}
      {ACCOUNT_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={useNavStyle ? accountNavItemClass(isAccountRoute(item.href), isMobile) : accountMenuItemClass(isAccountRoute(item.href))}
          role="menuitem"
          aria-current={isAccountRoute(item.href) ? "page" : undefined}
          aria-label={item.label}
          onClick={() => onNavigate(item.href)}
        >
          <span className="inline-flex size-[24px] items-center justify-center">{item.icon}</span>
          <span className={itemLabelClass}>{item.label}</span>
        </Link>
      ))}
      <button type="button" className={useNavStyle ? accountNavItemClass(false, isMobile, true) : accountMenuItemClass(false, true)} role="menuitem" onClick={onSignOut}>
        <span className="inline-flex size-[18px] items-center justify-center">
          <svg viewBox="0 0 24 24" className="size-[18px]">
            <path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M14 16l4-4-4-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M18 12H9" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        </span>
        <span className={itemLabelClass}>Sign out</span>
      </button>
    </>
  );
}