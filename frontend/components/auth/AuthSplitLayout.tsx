import type { ReactNode } from "react";

import Image from "next/image";
import Link from "next/link";

import logo from "@/logo.png";

import { PublicShell } from "@/components/layout/PublicShell";

type AuthSplitLayoutProps = {
  eyebrow: string;
  title: string;
  description: string;
  featureTitle: string;
  featureItems: string[];
  children: ReactNode;
};

export function AuthSplitLayout({
  eyebrow,
  title,
  description,
  featureTitle,
  featureItems,
  children,
}: AuthSplitLayoutProps) {
  return (
    <PublicShell contentClassName="px-0 pb-0">
      <div className="mx-auto grid min-h-[calc(100svh-4.25rem)] w-full max-w-none overflow-hidden border-y border-slate-900/10 bg-[rgba(244,246,248,0.88)] shadow-[0_20px_54px_rgba(15,23,42,0.10)] backdrop-blur-[18px] lg:rounded-none lg:border dark:border-white/10 dark:bg-[rgba(54,59,68,0.88)] dark:shadow-[0_24px_70px_rgba(0,0,0,0.34)] lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)]">
        <section className="relative hidden flex-col justify-between overflow-hidden border-r border-slate-900/10 bg-[radial-gradient(circle_at_top_left,rgba(10,132,208,0.2),transparent_32%),linear-gradient(155deg,#0f172a_0%,#0b3c63_48%,#0f7bc2_100%)] p-8 text-white lg:flex dark:border-white/10">
          {/* <div className="relative z-10 flex items-center justify-between gap-4">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="inline-flex size-12 items-center justify-center overflow-hidden rounded-none border border-white/15 bg-white/10 p-1.5">
                <Image src={logo} alt="Sagent logo" className="size-full object-contain" priority />
              </span>
              <span className="text-lg font-semibold tracking-[-0.03em]">Sagent</span>
            </Link>
            <span className="rounded-none border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white/80">Voice AI Ops</span>
          </div> */}
          <div className="relative z-10 mt-10 flex flex-1 flex-col justify-center gap-6 lg:mt-0">
            <div className="grid gap-3">
              {/* <p className="text-[0.76rem] font-semibold uppercase tracking-[0.18em] text-cyan-100">{eyebrow}</p> */}
              <h1 className="max-w-[12ch] text-[clamp(2.4rem,5vw,4.6rem)] font-semibold leading-[0.95] tracking-[-0.05em]">{title}</h1>
              <p className="max-w-[52ch] text-base leading-7 text-slate-100/82">{description}</p>
            </div>
            {/* <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              <article className="border border-white/12 bg-white/8 p-4 backdrop-blur-[10px]">
                <div className="text-sm font-semibold uppercase tracking-[0.14em] text-cyan-100">Outbound orchestration</div>
                <p className="mt-2 text-sm leading-6 text-slate-100/80">Launch AI-guided calls with live status, transcript streaming, and operator oversight.</p>
              </article>
              <article className="border border-white/12 bg-white/8 p-4 backdrop-blur-[10px]">
                <div className="text-sm font-semibold uppercase tracking-[0.14em] text-cyan-100">Account controls</div>
                <p className="mt-2 text-sm leading-6 text-slate-100/80">Manage voice providers, prompts, and account behavior from a single operator console.</p>
              </article>
              <article className="border border-white/12 bg-white/8 p-4 backdrop-blur-[10px]">
                <div className="text-sm font-semibold uppercase tracking-[0.14em] text-cyan-100">Realtime review</div>
                <p className="mt-2 text-sm leading-6 text-slate-100/80">Watch partial transcripts and call states as the AI moves through each conversation.</p>
              </article>
            </div> */}
          </div>
          {/* <div className="relative z-10 mt-8 border border-white/12 bg-slate-950/20 p-5 backdrop-blur-[10px]">
            <div className="text-sm font-semibold uppercase tracking-[0.14em] text-cyan-100">{featureTitle}</div>
            <ul className="mt-3 grid gap-3 text-sm leading-6 text-slate-100/82">
              {featureItems.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-2 size-2 shrink-0 rounded-none bg-cyan-200" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div> */}
        </section>
        <section className="flex min-w-0 items-center justify-center px-4 py-6 sm:px-6 sm:py-8 lg:p-10 xl:p-12">
          <div className="w-full max-w-[520px]">{children}</div>
        </section>
      </div>
    </PublicShell>
  );
}