import Image from "next/image";

import { cn } from "@/lib/ui";


export function UserAvatar({
  avatarUrl,
  fallback,
  className,
  imageClassName,
}: {
  avatarUrl?: string | null;
  fallback: string;
  className?: string;
  imageClassName?: string;
}) {
  if (avatarUrl) {
    return (
      <span className={cn("relative inline-flex overflow-hidden", className)}>
        <Image
          src={avatarUrl}
          alt="Profile avatar"
          fill
          unoptimized
          sizes="40px"
          className={cn("object-cover", imageClassName)}
        />
      </span>
    );
  }

  return <span className={className}>{fallback}</span>;
}