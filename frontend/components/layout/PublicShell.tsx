import type { ReactNode } from "react";

import { PublicHeader } from "@/components/layout/public-shell/PublicHeader";
import { cn } from "@/lib/ui";

type PublicShellProps = {
  children: ReactNode;
  shellClassName?: string;
  contentClassName?: string;
};

export function PublicShell({ children, shellClassName, contentClassName }: PublicShellProps) {
  return (
    <div className={cn("min-h-screen min-h-svh overflow-x-hidden", shellClassName)}>
      <PublicHeader />
      <main className={cn("px-4 pb-4 pt-24 sm:px-6 sm:pb-6 sm:pt-28", contentClassName)}>{children}</main>
    </div>
  );
}