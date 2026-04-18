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
      <main className={cn("pt-[4.25rem]", contentClassName)}>{children}</main>
    </div>
  );
}