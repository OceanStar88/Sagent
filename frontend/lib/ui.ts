export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const panelBaseClass = "rounded-none border border-slate-900/10 bg-[rgba(244,246,248,0.9)] shadow-[0_20px_54px_rgba(15,23,42,0.10)] backdrop-blur-[18px] dark:border-white/10 dark:bg-[rgba(54,59,68,0.9)] dark:shadow-[0_24px_70px_rgba(0,0,0,0.34)]";

export const pageStackClass = "flex flex-col gap-6";
export const panelClass = `${panelBaseClass} flex flex-col gap-5 p-5 sm:p-6`;
export const heroPanelClass = `${panelBaseClass} flex flex-col gap-5 bg-[linear-gradient(180deg,rgba(247,249,251,0.98),rgba(244,246,248,0.9))] p-5 sm:p-6 dark:bg-[linear-gradient(180deg,rgba(66,72,82,0.96),rgba(54,59,68,0.9))]`;
export const nestedPanelClass = `${panelBaseClass} flex flex-col gap-5 p-5`;
export const compactPanelClass = `${panelBaseClass} p-4`;

export const eyebrowClass = "m-0 text-[0.76rem] font-semibold uppercase tracking-[0.18em] text-indigo-700 dark:text-indigo-300";
export const pageTitleClass = "m-0 text-[clamp(2rem,4vw,3.1rem)] leading-none tracking-[-0.03em] text-slate-900 dark:text-zinc-100";
export const sectionTitleClass = "m-0 text-[1.15rem] font-semibold leading-tight text-slate-900 dark:text-zinc-100";
export const ledeClass = "text-[0.98rem] leading-7 text-slate-500 dark:text-slate-400";
export const mutedClass = "text-slate-500 dark:text-slate-400";
export const listMetaClass = "text-xs text-slate-500 dark:text-slate-400";

export const fieldClass = "grid gap-2.5";
export const labelClass = "text-[0.92rem] font-semibold text-slate-900 dark:text-zinc-100";
export const inputClass = "w-full rounded-none border border-slate-900/10 bg-slate-100 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-indigo-600/35 focus:ring-4 focus:ring-indigo-500/12 dark:border-white/10 dark:bg-[#3a404a] dark:text-zinc-100 dark:placeholder:text-slate-400 dark:focus:border-indigo-400/35 dark:focus:ring-indigo-400/15";
export const textareaClass = `${inputClass} min-h-40 resize-y`;

export const buttonRowClass = "flex flex-wrap gap-3";
export const buttonClass = "inline-flex items-center justify-center rounded-none border border-transparent bg-[linear-gradient(135deg,#0078d4,#005a9e)] px-4 py-3 text-sm font-medium text-white transition duration-150 hover:-translate-y-px hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60 disabled:transform-none dark:bg-[linear-gradient(135deg,#3794ff,#78b7ff)] dark:text-slate-950";
export const secondaryButtonClass = "inline-flex items-center justify-center rounded-none border border-indigo-600/20 bg-indigo-500/12 px-4 py-3 text-sm font-medium text-slate-900 transition duration-150 hover:-translate-y-px hover:bg-indigo-500/18 disabled:cursor-not-allowed disabled:opacity-60 disabled:transform-none dark:border-indigo-400/20 dark:bg-indigo-400/12 dark:text-zinc-100 dark:hover:bg-indigo-400/18";
export const ghostButtonClass = "inline-flex items-center justify-center rounded-none border border-slate-900/10 bg-slate-200/80 px-4 py-3 text-sm font-medium text-slate-900 transition duration-150 hover:-translate-y-px hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60 disabled:transform-none dark:border-white/10 dark:bg-slate-700/70 dark:text-zinc-100 dark:hover:bg-slate-700";

export const alertClass = "rounded-none border border-indigo-600/20 bg-indigo-500/10 px-4 py-3 text-sm text-slate-900 dark:border-indigo-400/25 dark:bg-indigo-400/12 dark:text-zinc-100";
export const dangerAlertClass = "rounded-none border border-red-600/25 bg-red-600/10 px-4 py-3 text-sm text-slate-900 dark:border-red-400/30 dark:bg-red-400/14 dark:text-zinc-100";

export const statsGridClass = "grid gap-3 sm:grid-cols-3";
export const statCardClass = `${compactPanelClass} flex flex-col gap-2`;
export const statValueClass = "text-2xl font-semibold tracking-[-0.03em] text-slate-900 dark:text-zinc-100";

export const splitGridClass = "grid gap-4 xl:grid-cols-2";
export const settingsGridClass = "grid gap-4";
export const callLayoutClass = "grid gap-4 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] xl:items-start";
export const contactGridClass = "grid gap-3 sm:grid-cols-2";
export const contactCardClass = "flex items-center justify-between gap-4 rounded-none border border-slate-900/10 bg-slate-200/70 px-4 py-4 dark:border-white/10 dark:bg-slate-700/55";
export const historyListClass = "flex flex-col gap-3";
export const transcriptStreamClass = "flex max-h-[62vh] flex-col gap-3 overflow-y-auto pr-1";
export const emptyStateClass = "rounded-none border border-dashed border-slate-900/10 px-4 py-8 text-center text-sm text-slate-500 dark:border-white/10 dark:text-slate-400";
export const messageHeaderClass = "flex items-start justify-between gap-3";
export const pillRowClass = "flex flex-wrap gap-2";
export const statusPillClass = "inline-flex items-center gap-2 rounded-none border border-indigo-600/15 bg-indigo-500/10 px-3 py-1.5 text-xs font-medium capitalize text-slate-900 dark:border-indigo-400/20 dark:bg-indigo-400/12 dark:text-zinc-100";
export const speakerPillClass = "inline-flex items-center gap-2 rounded-none border border-slate-900/10 bg-slate-200/70 px-3 py-1 text-xs font-medium capitalize text-slate-900 dark:border-white/10 dark:bg-slate-700/55 dark:text-zinc-100";

export function statusDotClass(status: string) {
  const value = status.toLowerCase();

  if (["completed", "ready", "connected"].includes(value)) {
    return "size-2 rounded-none bg-green-600 dark:bg-green-400";
  }

  if (["dialing", "ringing", "queued", "thinking", "in_progress"].includes(value)) {
    return "size-2 rounded-none bg-amber-500 dark:bg-amber-300";
  }

  if (["failed", "error", "ended"].includes(value)) {
    return "size-2 rounded-none bg-red-600 dark:bg-red-400";
  }

  return "size-2 rounded-none bg-indigo-600 dark:bg-indigo-400";
}

export function historyItemClass(active: boolean) {
  return cn(
    "cursor-pointer rounded-none border px-4 py-4 transition duration-150",
    active
      ? "border-indigo-600/25 bg-indigo-500/10 dark:border-indigo-400/25 dark:bg-indigo-400/12"
      : "border-slate-900/10 bg-slate-200/70 hover:border-indigo-600/20 hover:bg-slate-200 dark:border-white/10 dark:bg-slate-700/55 dark:hover:border-indigo-400/20 dark:hover:bg-slate-700",
  );
}

export function messageCardClass(speaker: string, partial = false) {
  const value = speaker.toLowerCase();

  if (value === "assistant" || value === "agent") {
    return cn(
      "rounded-none border px-4 py-4",
      partial
        ? "border-indigo-600/20 bg-indigo-500/10 opacity-80 dark:border-indigo-400/20 dark:bg-indigo-400/12"
        : "border-indigo-600/20 bg-indigo-500/10 dark:border-indigo-400/20 dark:bg-indigo-400/12",
    );
  }

  return cn(
    "rounded-none border px-4 py-4",
    partial
      ? "border-amber-500/20 bg-amber-500/10 opacity-80 dark:border-amber-300/20 dark:bg-amber-300/12"
      : "border-slate-900/10 bg-slate-200/70 dark:border-white/10 dark:bg-slate-700/55",
  );
}

export function speakerDotToneClass(speaker: string) {
  const value = speaker.toLowerCase();
  return value === "assistant" || value === "agent"
    ? "size-2 rounded-none bg-indigo-600 dark:bg-indigo-400"
    : "size-2 rounded-none bg-amber-500 dark:bg-amber-300";
}

export function themeOptionClass(active: boolean) {
  return cn(
    "flex h-full flex-col gap-4 rounded-none border px-4 py-4 text-left transition duration-150",
    active
      ? "border-indigo-600/30 bg-[linear-gradient(135deg,rgba(0,120,212,0.12),transparent_70%),rgba(225,231,239,0.96)] shadow-[0_0_0_1px_rgba(0,120,212,0.14)] dark:border-indigo-400/30 dark:bg-[linear-gradient(135deg,rgba(55,148,255,0.12),transparent_70%),rgba(74,81,94,0.94)] dark:shadow-[0_0_0_1px_rgba(55,148,255,0.16)]"
      : "border-slate-900/10 bg-slate-200/70 hover:border-indigo-600/16 hover:bg-slate-200 dark:border-white/10 dark:bg-slate-700/55 dark:hover:border-indigo-400/16 dark:hover:bg-slate-700",
  );
}

export const themeOptionToplineClass = "flex items-center gap-3";
export const themeOptionBadgeClass = "ml-auto rounded-none border border-indigo-600/25 bg-indigo-500/10 px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-indigo-700 dark:border-indigo-400/25 dark:bg-indigo-400/12 dark:text-indigo-300";