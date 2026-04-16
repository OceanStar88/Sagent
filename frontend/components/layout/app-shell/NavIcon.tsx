import type { ReactNode } from "react";

import { cn } from "@/lib/ui";

import type { NavIconRenderer } from "./nav";

export function NavIcon({ active, render }: { active: boolean; render: NavIconRenderer }) {
  return (
    <span className="relative inline-flex size-6 items-center justify-center">
      <span className={cn("absolute inset-0 flex items-center justify-center transition-opacity duration-150 group-hover:opacity-0", active ? "opacity-0" : "opacity-100")}>
        {render(false)}
      </span>
      <span className={cn("absolute inset-0 flex items-center justify-center transition-opacity duration-150 group-hover:opacity-100", active ? "opacity-100" : "opacity-0")}>
        {render(true)}
      </span>
    </span>
  );
}