import Image from "next/image";

import { cn } from "@/lib/ui";
import logo from "@/logo.png";

export function BrandMark({ bordered = false }: { bordered?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex size-11 items-center justify-center overflow-hidden rounded-none",
        bordered && "border border-slate-900/10 dark:border-white/12",
      )}
    >
      <Image src={logo} alt="Sagent logo" className="size-[40px] object-contain" priority />
    </span>
  );
}