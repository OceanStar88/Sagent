import type { AuthUser } from "@/types";

const TOKEN_KEY = "sagent.token";
const USER_KEY = "sagent.user";
export const USER_UPDATED_EVENT = "sagent:user-updated";

function emitUserUpdated(user: AuthUser | null): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent<AuthUser | null>(USER_UPDATED_EVENT, { detail: user }));
  }
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(TOKEN_KEY, token);
  }
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawUser = window.localStorage.getItem(USER_KEY);
  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as AuthUser;
  } catch {
    window.localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function setStoredUser(user: AuthUser): void {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    emitUserUpdated(user);
  }
}

export function clearStoredToken(): void {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
    emitUserUpdated(null);
  }
}
