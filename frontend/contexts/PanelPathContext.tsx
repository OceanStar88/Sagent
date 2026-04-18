"use client";

import { createContext, useContext } from "react";

export type PanelPathState = {
  headerLabel: string;
  titleLabel: string;
};

type PanelPathContextType = {
  panelPath: PanelPathState | null;
  setPanelPath: (panelPath: PanelPathState | null) => void;
};

const PanelPathContext = createContext<PanelPathContextType | undefined>(undefined);

export function PanelPathProvider({
  panelPath,
  setPanelPath,
  children,
}: {
  panelPath: PanelPathState | null;
  setPanelPath: (panelPath: PanelPathState | null) => void;
  children: React.ReactNode;
}) {
  return <PanelPathContext.Provider value={{ panelPath, setPanelPath }}>{children}</PanelPathContext.Provider>;
}

export function usePanelPath() {
  const context = useContext(PanelPathContext);
  if (!context) {
    return {
      panelPath: null,
      setPanelPath: () => undefined,
    };
  }
  return context;
}
