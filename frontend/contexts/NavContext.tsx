"use client";

import { createContext, useContext } from "react";
import type { NavItem, AccountItem } from "@/components/layout/app-shell/nav";

export type CurrentNavItem = (NavItem | AccountItem) | null;

interface NavContextType {
  currentNavItem: CurrentNavItem;
}

const NavContext = createContext<NavContextType | undefined>(undefined);

export function NavProvider({ children, currentNavItem }: { children: React.ReactNode; currentNavItem: CurrentNavItem }) {
  return <NavContext.Provider value={{ currentNavItem }}>{children}</NavContext.Provider>;
}

export function useCurrentNavItem(): CurrentNavItem {
  const context = useContext(NavContext);
  // Return null if not in provider (graceful fallback for SSR or component rendering outside provider)
  return context?.currentNavItem ?? null;
}
