"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import logo from "@/logo.png";

import { ThemeToggleButton } from "@/components/layout/public-shell/ThemeToggleButton";
import { cn } from "@/lib/ui";

const publicNavItems = [
  { href: "/signin", label: "Sign in" },
  { href: "/signup", label: "Sign up" },
];

export function PublicHeader() {
  const pathname = usePathname();

  return (
    <header className="fixed inset-x-0 top-0 z-[120] border-b border-slate-900/10 bg-[rgba(236,239,243,0.82)] shadow-[0_14px_38px_rgba(15,23,42,0.08)] backdrop-blur-[18px] dark:border-white/10 dark:bg-[rgba(24,28,34,0.78)] dark:shadow-[0_18px_48px_rgba(0,0,0,0.28)]">
      <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <span className="inline-flex size-11 items-center justify-center overflow-hidden p-1.5">
            <Image src={logo} alt="Sagent logo" className="size-full object-contain" priority />
          </span>
          <span className="grid min-w-0 gap-0.5 leading-none">
            <span className="text-xl font-semibold tracking-[-0.04em] text-slate-900 dark:text-zinc-100">Sagent</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <nav className="flex items-center gap-2">
            {publicNavItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex items-center rounded-none border px-3 py-2 text-sm font-medium transition duration-150 whitespace-nowrap",
                    isActive
                      ? "border-indigo-600/25 bg-indigo-500/10 text-indigo-700 dark:border-indigo-400/25 dark:bg-indigo-400/12 dark:text-indigo-300"
                      : "border-slate-900/10 bg-slate-100/70 text-slate-700 hover:border-indigo-600/20 hover:bg-slate-100 dark:border-white/10 dark:bg-slate-700/55 dark:text-slate-200 dark:hover:border-indigo-400/20 dark:hover:bg-slate-700",
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <ThemeToggleButton />
        </div>
      </div>
    </header>
  );
}