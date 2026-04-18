"use client";

import Link from "next/link";

import { PublicShell } from "@/components/layout/PublicShell";
import { useAuth } from "@/hooks/useAuth";
import { buttonClass, ghostButtonClass } from "@/lib/ui";

export default function LandingPage() {
  const { token } = useAuth();

  return (
    <PublicShell>
      <div className="mx-auto grid w-full gap-0 xl:h-[calc(100svh-4.25rem)] xl:grid-cols-[minmax(0,1.16fr)_minmax(0,0.84fr)] xl:items-stretch">
        <section className="relative overflow-hidden rounded-none border border-slate-900/10 bg-[radial-gradient(circle_at_top_left,rgba(10,132,208,0.18),transparent_28%),linear-gradient(160deg,#eef5fb_0%,#dfe8f2_42%,#d3dee8_100%)] p-6 shadow-[0_20px_54px_rgba(15,23,42,0.10)] sm:p-8 xl:h-full dark:border-white/10 dark:bg-[radial-gradient(circle_at_top_left,rgba(79,193,255,0.14),transparent_24%),linear-gradient(160deg,#1f252d_0%,#1a2330_45%,#10253c_100%)] dark:shadow-[0_24px_70px_rgba(0,0,0,0.34)]">
          <div className="absolute inset-y-0 right-0 hidden w-[42%] border-l border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),transparent)] lg:block dark:border-white/8" />
          <div className="relative z-10 grid gap-8 lg:content-between">
            <div className="grid gap-6">
              <div className="grid gap-3">
                <p className="text-[0.76rem] font-semibold uppercase tracking-[0.18em] text-indigo-700 dark:text-cyan-300">Call operations without the fog</p>
                <h1 className="max-w-[13ch] text-[clamp(3rem,6vw,6.4rem)] font-semibold leading-[0.92] tracking-[-0.06em] text-slate-950 dark:text-white">Voice AI execution for serious operator teams.</h1>
                <p className="max-w-[56ch] text-base leading-8 text-slate-600 dark:text-slate-300">Sagent gives your team a single control surface to launch calls, inspect live transcripts, tune prompts, and manage provider settings as one operating system for AI voice work.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href={token ? "/home" : "/signup"} className={buttonClass}>{token ? "Open dashboard" : "Sign up"}</Link>
                <Link href="/signin" className={ghostButtonClass}>Sign in</Link>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <article className="border border-slate-900/10 bg-white/55 p-4 backdrop-blur-[8px] dark:border-white/10 dark:bg-white/6">
                <div className="text-3xl font-semibold tracking-[-0.05em] text-slate-950 dark:text-white">Live</div>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">Observe agent and caller turns as they happen.</p>
              </article>
              <article className="border border-slate-900/10 bg-white/55 p-4 backdrop-blur-[8px] dark:border-white/10 dark:bg-white/6">
                <div className="text-3xl font-semibold tracking-[-0.05em] text-slate-950 dark:text-white">Config</div>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">Control prompts and provider credentials from one place.</p>
              </article>
              <article className="border border-slate-900/10 bg-white/55 p-4 backdrop-blur-[8px] dark:border-white/10 dark:bg-white/6">
                <div className="text-3xl font-semibold tracking-[-0.05em] text-slate-950 dark:text-white">History</div>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">Review past calls with transcripts and status context.</p>
              </article>
            </div>
          </div>
        </section>
        <section className="grid gap-0 xl:grid-rows-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <article className="rounded-none border border-slate-900/10 bg-[rgba(244,246,248,0.9)] p-6 shadow-[0_20px_54px_rgba(15,23,42,0.10)] backdrop-blur-[18px] dark:border-white/10 dark:bg-[rgba(54,59,68,0.9)] dark:shadow-[0_24px_70px_rgba(0,0,0,0.34)]">
            <div className="grid gap-2">
              <p className="text-[0.76rem] font-semibold uppercase tracking-[0.18em] text-indigo-700 dark:text-indigo-300">Operator console</p>
              <h2 className="text-[2rem] font-semibold tracking-[-0.04em] text-slate-950 dark:text-white">Built for fast intervention, not dashboard theater.</h2>
              <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">The product surface is structured around what operators actually need during active call programs: immediate state, current transcript context, and fast setting changes.</p>
            </div>
          </article>
          <article className="rounded-none border border-slate-900/10 bg-[rgba(244,246,248,0.9)] p-6 shadow-[0_20px_54px_rgba(15,23,42,0.10)] backdrop-blur-[18px] dark:border-white/10 dark:bg-[rgba(54,59,68,0.9)] dark:shadow-[0_24px_70px_rgba(0,0,0,0.34)]">
            <div className="grid gap-3">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-indigo-700 dark:text-indigo-300">Core flows</p>
              <div className="grid gap-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                <div className="border border-slate-900/10 bg-slate-100/70 p-4 dark:border-white/10 dark:bg-slate-700/50">Sign in and move directly into call operations, settings, and account controls.</div>
                <div className="border border-slate-900/10 bg-slate-100/70 p-4 dark:border-white/10 dark:bg-slate-700/50">Create an operator account and start configuring voice workflows in a single step.</div>
                <div className="border border-slate-900/10 bg-slate-100/70 p-4 dark:border-white/10 dark:bg-slate-700/50">Run the same UI across desktop and mobile without losing the shell navigation model.</div>
              </div>
            </div>
          </article>
        </section>
      </div>
    </PublicShell>
  );
}
