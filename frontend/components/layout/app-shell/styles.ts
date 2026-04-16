import { cn } from "@/lib/ui";

export const mobileHeaderHeightClass = "h-16";

export const shellSurfaceClass = "border border-slate-900/10 bg-[rgba(209,213,219,0.94)] text-[#252526] shadow-[0_20px_54px_rgba(15,23,42,0.10)] dark:border-white/12 dark:bg-[rgba(31,41,55,0.95)] dark:text-[#cccccc] dark:shadow-[0_24px_70px_rgba(0,0,0,0.34)]";
export const shellElevatedClass = "border border-slate-900/10 bg-[rgba(221,225,231,0.96)] text-[#252526] shadow-[0_20px_54px_rgba(15,23,42,0.10)] dark:border-white/12 dark:bg-[rgba(38,49,64,0.98)] dark:text-[#cccccc] dark:shadow-[0_24px_70px_rgba(0,0,0,0.34)]";
export const shellControlClass = "inline-flex items-center justify-center rounded-none border border-slate-900/10 bg-[rgba(221,225,231,0.68)] text-[#252526] transition duration-150 hover:-translate-y-px hover:border-indigo-600/20 hover:bg-indigo-500/8 dark:border-white/12 dark:bg-[rgba(38,49,64,0.68)] dark:text-[#cccccc] dark:hover:border-indigo-400/20 dark:hover:bg-indigo-400/10";
export const accountAvatarClass = "inline-flex size-[40px] items-center justify-center rounded-none border border-indigo-600/20 bg-[radial-gradient(circle_at_30%_28%,rgba(255,255,255,0.22),transparent_48%),linear-gradient(145deg,#0078d4,#0a84d0_42%,#005a9e)] text-sm font-bold tracking-[0.01em] text-[#f8fbff] shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_8px_18px_rgba(0,120,212,0.18)] dark:border-indigo-400/25 dark:bg-[radial-gradient(circle_at_30%_28%,rgba(255,255,255,0.18),transparent_48%),linear-gradient(145deg,#3794ff,#4fc1ff_42%,#78b7ff)] dark:text-slate-950 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_8px_18px_rgba(55,148,255,0.2)]";

export function accountMenuItemClass(active: boolean, danger = false) {
  if (danger) {
    return "flex w-full items-center gap-2 rounded-none py-2 text-left text-sm text-red-700 transition hover:bg-red-600/10 dark:text-red-300 dark:hover:bg-red-400/12";
  }

  return cn(
    "flex w-full items-center gap-2 rounded-none py-2 text-left text-sm transition",
    active
      ? "bg-indigo-500/10 text-[#252526] dark:bg-indigo-400/12 dark:text-[#cccccc]"
      : "text-slate-600 hover:bg-indigo-500/8 hover:text-[#252526] dark:text-slate-300 dark:hover:bg-indigo-400/10 dark:hover:text-[#cccccc]",
  );
}

export function accountNavItemClass(active: boolean, mobile = false, danger = false) {
  const baseClass = cn(
    mobile ? mobileNavLinkClass(active) : navLinkClass(active),
    "min-h-[64px] gap-1 py-2.5",
  );

  if (danger) {
    return cn(
      baseClass,
      "text-red-700 hover:bg-red-600/10 hover:text-red-800 dark:text-red-300 dark:hover:bg-red-400/12 dark:hover:text-red-200",
    );
  }

  return baseClass;
}

export function navLinkClass(active: boolean) {
  return cn(
    "group relative grid w-full min-w-0 max-w-full min-h-[72px] place-items-center gap-1 overflow-hidden rounded-none border border-transparent py-2 text-center transition duration-150",
    active
      ? "text-indigo-600 dark:text-indigo-400 bg-indigo-700/8 dark:bg-indigo-300/10 hover:bg-indigo-500/8 dark:hover:bg-indigo-400/10"
      : "text-slate-600 hover:bg-indigo-500/8 hover:text-indigo-700 dark:text-slate-300 dark:hover:bg-indigo-400/10 dark:hover:text-indigo-300",
  );
}

export function mobileNavLinkClass(active: boolean) {
  return cn(
    "group relative grid w-full min-w-0 max-w-full min-h-[72px] place-items-center gap-1 overflow-hidden rounded-none border border-transparent py-2 text-center transition duration-150",
    active
      ? "text-indigo-600 dark:text-indigo-400 bg-indigo-700/8 dark:bg-indigo-300/10 hover:bg-indigo-500/8 dark:hover:bg-indigo-400/10"
      : "text-slate-600 hover:bg-indigo-500/8 hover:text-indigo-700 dark:text-slate-300 dark:hover:bg-indigo-400/10 dark:hover:text-indigo-300",
  );
}