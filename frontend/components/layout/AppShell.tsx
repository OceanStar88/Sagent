"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

import { UserAvatar } from "@/components/account/UserAvatar";
import { AccountMenuContent } from "@/components/layout/app-shell/AccountMenuContent";
import { BrandMark } from "@/components/layout/app-shell/BrandMark";
import { ACCOUNT_ITEMS, NAV_ITEMS } from "@/components/layout/app-shell/nav";
import { NavIcon } from "@/components/layout/app-shell/NavIcon";
import {
  accountAvatarClass,
  mobileHeaderHeightClass,
  mobileNavLinkClass,
  navLinkClass,
  shellControlClass,
  shellSurfaceClass,
} from "@/components/layout/app-shell/styles";
import { useThemePreference } from "@/hooks/useThemePreference";
import type { AuthUser } from "@/types";

import { getCurrentUser } from "@/lib/api";
import { USER_UPDATED_EVENT, clearStoredToken, getStoredToken, getStoredUser, setStoredUser } from "@/lib/auth";
import { cn, eyebrowClass, ghostButtonClass, ledeClass, secondaryButtonClass, sectionTitleClass } from "@/lib/ui";

export function AppShell({ children }: { children: ReactNode }) {
  // Delay unmounting mobile overlays until their exit transitions complete.
  const mobileNavCloseTimeoutRef = useRef<number | null>(null);
  const mobileAccountMenuCloseTimeoutRef = useRef<number | null>(null);

  // Route and DOM references drive active states and outside-click handling.
  const pathname = usePathname();
  const router = useRouter();
  const accountMenuRef = useRef<HTMLDivElement | null>(null);
  const activePageLabel = NAV_ITEMS.find((item) => item.href === pathname)?.label ?? "Dashboard";

  // Desktop and mobile menus are tracked separately because they use different layouts and transitions.
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isMobileAccountMenuOpen, setIsMobileAccountMenuOpen] = useState(false);
  const [isMobileAccountMenuMounted, setIsMobileAccountMenuMounted] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isMobileNavMounted, setIsMobileNavMounted] = useState(false);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);

  // Sync the UI theme with the persisted user or local preference layer.
  useThemePreference();

  // Derive compact account presentation values for the shell controls.
  const accountInitial = authUser?.display_name?.charAt(0).toUpperCase() || "A";
  const accountAvatarUrl = authUser?.avatar_url ?? null;

  // Clear any pending delayed unmount for the mobile navigation rail.
  function clearMobileNavCloseTimeout() {
    if (mobileNavCloseTimeoutRef.current !== null) {
      window.clearTimeout(mobileNavCloseTimeoutRef.current);
      mobileNavCloseTimeoutRef.current = null;
    }
  }

  function clearMobileAccountMenuCloseTimeout() {
    if (mobileAccountMenuCloseTimeoutRef.current !== null) {
      window.clearTimeout(mobileAccountMenuCloseTimeoutRef.current);
      mobileAccountMenuCloseTimeoutRef.current = null;
    }
  }

  function openMobileNav() {
    clearMobileNavCloseTimeout();
    setIsMobileNavMounted(true);
    // Mount first, then animate in on the next frame so the slide transition can run.
    window.requestAnimationFrame(() => {
      setIsMobileNavOpen(true);
    });
  }

  function closeMobileNav(immediate = false) {
    clearMobileNavCloseTimeout();
    setIsMobileNavOpen(false);

    // Immediate closes are used when another overlay takes over or the session ends.
    if (immediate) {
      setIsMobileNavMounted(false);
      return;
    }

    // Keep the rail mounted just long enough for the exit animation to finish.
    mobileNavCloseTimeoutRef.current = window.setTimeout(() => {
      setIsMobileNavMounted(false);
      mobileNavCloseTimeoutRef.current = null;
    }, 180);
  }

  function openMobileAccountMenu() {
    clearMobileAccountMenuCloseTimeout();
    setIsMobileAccountMenuMounted(true);
    // Mirror the mobile nav behavior so the account rail slides in instead of popping in.
    window.requestAnimationFrame(() => {
      setIsMobileAccountMenuOpen(true);
    });
  }

  function closeMobileAccountMenu(immediate = false) {
    clearMobileAccountMenuCloseTimeout();
    setIsMobileAccountMenuOpen(false);

    // Immediate closes are used when switching overlays or leaving the authenticated shell.
    if (immediate) {
      setIsMobileAccountMenuMounted(false);
      return;
    }

    // Match the exit timing of the nav rail so both mobile panels feel consistent.
    mobileAccountMenuCloseTimeoutRef.current = window.setTimeout(() => {
      setIsMobileAccountMenuMounted(false);
      mobileAccountMenuCloseTimeoutRef.current = null;
    }, 180);
  }

  // Individual account items use exact route matching because each account page is its own destination.
  function isAccountRoute(href: string) {
    return pathname === href;
  }

  // Account routes are treated specially so the desktop account menu can remain open across navigation.
  function isAnyAccountRoute(currentPathname: string) {
    return ACCOUNT_ITEMS.some((item) => item.href === currentPathname);
  }

  // Unauthenticated users are redirected back to the public entry path.
  useEffect(() => {
    if (!getStoredToken()) {
      router.replace("/");
    }
  }, [router]);

  // Hydrate the shell with cached user data first, then refresh it from the API when a token exists.
  useEffect(() => {
    const storedUser = getStoredUser();
    if (storedUser) {
      setAuthUser(storedUser);
    }

    const token = getStoredToken();
    if (!token) {
      return;
    }

    getCurrentUser(token)
      .then((user) => {
        setStoredUser(user);
        setAuthUser(user);
      })
      .catch(() => {
        // Shell auth fallback is already handled by token checks and route redirects.
      });
  }, []);

  // Keep the shell avatar and labels in sync with profile updates from other tabs or pages.
  useEffect(() => {
    const handleUserUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<AuthUser | null>;
      setAuthUser(customEvent.detail ?? null);
    };

    const handleStorage = () => {
      setAuthUser(getStoredUser());
    };

    window.addEventListener(USER_UPDATED_EVENT, handleUserUpdated as EventListener);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener(USER_UPDATED_EVENT, handleUserUpdated as EventListener);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  // Reflect the active route in the document title for browser tabs and history entries.
  useEffect(() => {
    document.title = `${activePageLabel} | Sagent`;
  }, [activePageLabel]);

  // Route changes always collapse mobile overlays, while desktop account pages keep their menu expanded.
  useEffect(() => {
    closeMobileNav();
    closeMobileAccountMenu();
    // Account routes keep the desktop account menu visible after navigation.
    if (isAnyAccountRoute(pathname)) {
      setIsAccountMenuOpen(true);
    } else {
      setIsAccountMenuOpen(false);
    }
  }, [pathname]);

  // Any full-screen overlay should lock scrolling and support Escape as a universal close gesture.
  useEffect(() => {
    if (!isSignOutModalOpen && !isMobileNavMounted && !isMobileAccountMenuMounted) {
      document.body.style.removeProperty("overflow");
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsSignOutModalOpen(false);
        closeMobileNav();
        closeMobileAccountMenu();
      }
    };

    // Any active overlay should lock background scrolling on small screens.
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.removeProperty("overflow");
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isMobileAccountMenuMounted, isSignOutModalOpen, isMobileNavMounted]);

  // Clear delayed-unmount timers if the shell itself is removed.
  useEffect(() => {
    return () => {
      clearMobileNavCloseTimeout();
      clearMobileAccountMenuCloseTimeout();
    };
  }, []);

  // The mobile account rail has its own Escape handling because it can open independently of the nav rail.
  useEffect(() => {
    if (!isMobileAccountMenuOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMobileAccountMenu();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isMobileAccountMenuOpen]);

  // On non-account pages, the desktop account menu should dismiss when the user clicks elsewhere.
  useEffect(() => {
    if (!isAccountMenuOpen || isAnyAccountRoute(pathname)) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!accountMenuRef.current?.contains(event.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
    };
  }, [isAccountMenuOpen, pathname]);

  // Signing out clears both mobile overlays before leaving the authenticated shell.
  function logout() {
    clearStoredToken();
    closeMobileNav(true);
    closeMobileAccountMenu(true);
    router.replace("/");
  }

  // The sign-out confirmation takes precedence over any currently open navigation UI.
  function openSignOutModal() {
    setIsAccountMenuOpen(false);
    closeMobileAccountMenu(true);
    closeMobileNav();
    setIsSignOutModalOpen(true);
  }

  return (
    <div className="min-h-screen pb-0 lg:py-0">
      {/* Mobile top bar keeps the current page label centered between nav and account controls. */}
      <div className={cn("sticky left-0 right-0 top-0 z-[70] flex items-center justify-between gap-3 border-x-0 border-t-0 px-3 lg:hidden", mobileHeaderHeightClass, shellSurfaceClass)}>
        <button
          type="button"
          className={cn(
            shellControlClass,
            "size-11 overflow-hidden border-slate-900/10 bg-transparent dark:border-white/12",
            isMobileNavOpen && "border-indigo-600/25 dark:border-indigo-400/25",
          )}
          aria-label="Open navigation menu"
          aria-expanded={isMobileNavOpen}
          onClick={openMobileNav}
        >
          <BrandMark bordered />
        </button>
        <div className="min-w-0 text-center" aria-live="polite">
          <strong className="block truncate text-base text-slate-900 dark:text-zinc-100">{activePageLabel}</strong>
        </div>
        <div className="relative shrink-0">
          <button
            type="button"
            className={cn(
              shellControlClass,
              "size-11 overflow-hidden p-0",
              isMobileAccountMenuOpen && "border-indigo-600/25 dark:border-indigo-400/25",
            )}
            aria-label="Open account menu"
            aria-haspopup="menu"
            aria-expanded={isMobileAccountMenuOpen}
            onClick={() => {
              if (isMobileAccountMenuOpen) {
                closeMobileAccountMenu();
                return;
              }

              closeMobileNav(true);
              openMobileAccountMenu();
            }}
          >
            <UserAvatar
              avatarUrl={accountAvatarUrl}
              fallback={accountInitial}
              className={cn(accountAvatarClass, "size-11 border-0 shadow-none")}
            />
          </button>
        </div>
      </div>

      {/* Mobile account actions slide in from the right as a dedicated rail. */}
      {isMobileAccountMenuMounted ? (
        <div
          className={cn(
            "fixed inset-x-0 bottom-0 top-16 z-[69] bg-slate-950/10 transition-opacity duration-200 dark:bg-black/30 lg:hidden",
            isMobileAccountMenuOpen ? "opacity-100" : "opacity-0",
          )}
          role="presentation"
          onClick={() => closeMobileAccountMenu()}
        >
          <div
            className={cn(
              "ml-auto flex h-full w-[88px] max-w-full overflow-hidden border-l border-slate-900/10 bg-[rgba(209,213,219,0.94)] px-0 py-0 shadow-[-20px_0_40px_rgba(15,23,42,0.14)] transition duration-200 dark:border-white/12 dark:bg-[rgba(31,41,55,0.95)] dark:shadow-[-20px_0_40px_rgba(0,0,0,0.42)]",
              isMobileAccountMenuOpen ? "translate-x-0 scale-100 opacity-100" : "translate-x-[18px] scale-[0.985] opacity-0",
            )}
            role="dialog"
            aria-modal="true"
            aria-label="Account menu"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex h-full min-w-0 w-full justify-center overflow-x-hidden overflow-y-auto">
              <div className="grid w-full min-w-0 max-w-full content-start justify-items-center gap-1.5 overflow-x-hidden">
                <AccountMenuContent
                  user={authUser}
                  variant="mobile"
                  isAccountRoute={isAccountRoute}
                  onNavigate={() => closeMobileAccountMenu()}
                  onSignOut={openSignOutModal}
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Primary mobile navigation slides in from the left and shares the same shell styling language. */}
      {isMobileNavMounted ? (
        <div
          className={cn(
            "fixed inset-x-0 bottom-0 top-16 z-[69] bg-slate-950/10 transition-opacity duration-200 dark:bg-black/30 lg:hidden",
            isMobileNavOpen ? "opacity-100" : "opacity-0",
          )}
          role="presentation"
          onClick={() => closeMobileNav()}
        >
          <div
            className={cn(
              "relative z-[71] h-full w-[88px] max-w-full overflow-hidden border-r border-slate-900/10 bg-[rgba(209,213,219,0.94)] px-0 py-0 shadow-[20px_0_40px_rgba(15,23,42,0.14)] transition duration-200 dark:border-white/12 dark:bg-[rgba(31,41,55,0.95)] dark:shadow-[20px_0_40px_rgba(0,0,0,0.42)]",
              isMobileNavOpen ? "translate-x-0 scale-100 opacity-100" : "-translate-x-[18px] scale-[0.985] opacity-0",
            )}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex h-full min-w-0 justify-center overflow-x-hidden overflow-y-auto">
              <div className="grid w-full min-w-0 max-w-full content-start justify-items-center gap-1.5 overflow-x-hidden">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    className={mobileNavLinkClass(pathname === item.href)}
                    href={item.href}
                    aria-current={pathname === item.href ? "page" : undefined}
                  >
                    <NavIcon active={pathname === item.href} render={item.renderIcon} />
                    <span className="text-[0.82rem] font-medium leading-tight">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div
        className={cn(
          "lg:grid lg:min-h-screen lg:grid-cols-[96px_minmax(0,1fr)] lg:items-start lg:gap-0",
        )}
      >
        {/* Desktop mode pins the shell navigation into a narrow left rail. */}
        <aside
          className={cn(
            "relative z-20 hidden lg:sticky lg:py-1 lg:flex lg:h-screen lg:flex-col lg:self-start lg:overflow-visible lg:rounded-none lg:border-l-0 lg:border-t-0 lg:border-b-0 lg:px-1.5",
            shellSurfaceClass,
          )}
          aria-label="Primary navigation"
        >
          <div className="relative shrink-0 grid justify-items-center gap-1 px-1 py-1 text-center">
            <div className="grid justify-items-center gap-1 rounded-none px-0 py-1">
              <BrandMark />
              {/* <span className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Sagent</span> */}
            </div>
          </div>

          <div className="mt-3 min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto pr-0.5">
            <nav className="grid min-w-0 gap-1.5 overflow-x-hidden" aria-label="Primary">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={navLinkClass(isActive)}
                    aria-label={item.label}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <NavIcon active={isActive} render={item.renderIcon} />
                    <span className="text-[0.82rem] font-medium leading-tight">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="mt-auto shrink-0 border-t border-slate-900/10 pt-0 dark:border-white/12">
            <div ref={accountMenuRef} className="relative">
              {/* The account button controls the desktop dropup menu. */}
              <button
                type="button"
                className={cn(
                  "grid w-full min-h-[72px] place-items-center gap-0.5 rounded-none border border-transparent bg-transparent p-0.5 transition duration-150 hover:border-indigo-600/25 hover:bg-indigo-500/8 dark:hover:border-indigo-400/20 dark:hover:bg-indigo-400/10",
                  isAccountMenuOpen && "bg-indigo-500 border-indigo-400/20 dark:border-indigo-400/25",
                )}
                aria-label="Open account menu"
                aria-haspopup="menu"
                aria-expanded={isAccountMenuOpen}
                onClick={() => setIsAccountMenuOpen((current) => !current)}
              >
                <UserAvatar avatarUrl={accountAvatarUrl} fallback={accountInitial} className={accountAvatarClass} />
                {/* <span className="grid gap-0.5 leading-none">
                  <strong className="max-w-full truncate text-[0.7rem] font-medium text-slate-900 dark:text-zinc-100">{accountName}</strong>
                  <span className="max-w-full truncate text-[0.64rem] text-slate-500 dark:text-slate-400">{accountEmail}</span>
                </span> */}
              </button>

              {/* Desktop account pages live in a dropup attached directly above the account control. */}
              <div
                className={cn(
                  "absolute bottom-full left-0 z-[90] w-full overflow-hidden transition duration-150",
                  shellSurfaceClass,
                  isAccountMenuOpen
                    ? "pointer-events-auto translate-y-0 opacity-100"
                    : "pointer-events-none translate-y-2 opacity-0",
                )}
                role="menu"
              >
                <div className="grid justify-items-center gap-1.5 px-0 py-0 text-center">
                  <AccountMenuContent
                    user={authUser}
                    variant="desktop"
                    isAccountRoute={isAccountRoute}
                    onNavigate={() => undefined}
                    onSignOut={openSignOutModal}
                  />
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main className="relative z-0 flex min-h-[calc(100svh-4rem)] min-w-0 flex-col lg:min-h-screen lg:flex">
          {/* Children are stretched so each page can own the full available shell height. */}
          <div className="flex min-h-full w-full flex-1 flex-col [&>*]:flex [&>*]:min-h-full [&>*]:flex-1 [&>*]:flex-col">{children}</div>
        </main>
      </div>

      {/* Sign-out uses a dedicated confirmation modal instead of an inline destructive action. */}
      {isSignOutModalOpen ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/18 p-6 backdrop-blur-[8px] dark:bg-black/42" role="presentation" onClick={() => setIsSignOutModalOpen(false)}>
          <div
            className="w-full max-w-[420px] rounded-none border border-slate-900/10 bg-[rgba(243,244,246,0.92)] p-6 shadow-[0_20px_54px_rgba(15,23,42,0.10)] dark:border-white/10 dark:bg-[rgba(58,64,74,0.92)] dark:shadow-[0_24px_70px_rgba(0,0,0,0.34)]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="signout-title"
            aria-describedby="signout-description"
            onClick={(event) => event.stopPropagation()}
          >
            <p className={eyebrowClass}>Confirm action</p>
            <h2 id="signout-title" className={sectionTitleClass}>Really sign out?</h2>
            <p id="signout-description" className={ledeClass}>This will clear the current session token and return you to the login screen.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" className={ghostButtonClass} onClick={() => setIsSignOutModalOpen(false)}>
                Cancel
              </button>
              <button type="button" className={secondaryButtonClass} onClick={logout}>
                Sign out
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}