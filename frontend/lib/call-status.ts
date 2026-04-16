export type CanonicalCallStatus = "Live" | "Ended" | "Failed" | "Missed";

export function toCanonicalCallStatus(status: string): CanonicalCallStatus {
  const value = status.toLowerCase();

  if (["failed", "error", "busy"].includes(value)) {
    return "Failed";
  }

  if (["missed", "no_answer", "dropped"].includes(value)) {
    return "Missed";
  }

  if (["completed", "ended"].includes(value)) {
    return "Ended";
  }

  return "Live";
}

export function isLiveStatus(status: string): boolean {
  return toCanonicalCallStatus(status) === "Live";
}
