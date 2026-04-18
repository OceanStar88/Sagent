import type { ReactNode } from "react";

import type { NavIconRenderer } from "./nav";

export function NavIcon({ active, render }: { active: boolean; render: NavIconRenderer }) {
  return (
    <span className="relative inline-flex size-6 items-center justify-center">
      <span className="absolute inset-0 flex items-center justify-center">{render()}</span>
    </span>
  );
}