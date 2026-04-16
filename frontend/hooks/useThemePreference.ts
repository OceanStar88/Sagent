"use client";

import { useEffect, useMemo, useState } from "react";

import { updateUserPreferences } from "@/lib/api";
import { USER_UPDATED_EVENT, getStoredToken, getStoredUser, setStoredUser } from "@/lib/auth";
import type { ThemePreference } from "@/types";


const STORAGE_KEY = "sagent.theme";
const THEME_ORDER: ThemePreference[] = ["system", "light", "dark"];

let cachedThemePreference: ThemePreference | null = null;

function isThemePreference(value: string | null): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system";
}

function resolveTheme(preference: ThemePreference) {
  if (preference !== "system") {
    return preference;
  }

  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function nextThemePreference(preference: ThemePreference): ThemePreference {
  const currentIndex = THEME_ORDER.indexOf(preference);
  return THEME_ORDER[(currentIndex + 1) % THEME_ORDER.length];
}

function applyResolvedTheme(resolvedTheme: "light" | "dark") {
  document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
}

export function useThemePreference() {
  const [themePreference, setThemePreference] = useState<ThemePreference>(cachedThemePreference ?? "system");
  const [hasHydrated, setHasHydrated] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (cachedThemePreference) {
      return;
    }

    const storedUser = getStoredUser();
    if (storedUser && isThemePreference(storedUser.theme_preference)) {
      cachedThemePreference = storedUser.theme_preference;
      setThemePreference(storedUser.theme_preference);
      return;
    }

    const storedPreference = window.localStorage.getItem(STORAGE_KEY);
    const nextPreference = isThemePreference(storedPreference) ? storedPreference : "system";
    cachedThemePreference = nextPreference;
    setThemePreference(nextPreference);
  }, []);

  const resolvedTheme = useMemo(() => {
    if (!hasHydrated) {
      return "light";
    }

    return resolveTheme(themePreference);
  }, [hasHydrated, themePreference]);

  useEffect(() => {
    cachedThemePreference = themePreference;
    applyResolvedTheme(resolvedTheme);
    window.localStorage.setItem(STORAGE_KEY, themePreference);
  }, [resolvedTheme, themePreference]);

  useEffect(() => {
    if (themePreference !== "system") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      applyResolvedTheme(mediaQuery.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [themePreference]);

  useEffect(() => {
    const handleUserUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<{ theme_preference?: ThemePreference } | null>;
      const nextPreference = customEvent.detail?.theme_preference;
      if (nextPreference && isThemePreference(nextPreference)) {
        cachedThemePreference = nextPreference;
        setThemePreference(nextPreference);
      }
    };

    const handleStorage = () => {
      const storedUser = getStoredUser();
      if (storedUser && isThemePreference(storedUser.theme_preference)) {
        cachedThemePreference = storedUser.theme_preference;
        setThemePreference(storedUser.theme_preference);
        return;
      }

      const storedPreference = window.localStorage.getItem(STORAGE_KEY);
      if (isThemePreference(storedPreference)) {
        cachedThemePreference = storedPreference;
        setThemePreference(storedPreference);
      }
    };

    window.addEventListener(USER_UPDATED_EVENT, handleUserUpdated as EventListener);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener(USER_UPDATED_EVENT, handleUserUpdated as EventListener);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  async function persistThemePreference(nextPreference: ThemePreference) {
    const token = getStoredToken();
    const storedUser = getStoredUser();

    setSaveError(null);
    setThemePreference(nextPreference);

    if (storedUser) {
      setStoredUser({ ...storedUser, theme_preference: nextPreference });
    }

    if (!token) {
      return;
    }

    setSaving(true);
    try {
      const preferences = await updateUserPreferences(token, { theme_preference: nextPreference });
      const currentUser = getStoredUser();
      if (currentUser) {
        setStoredUser({ ...currentUser, theme_preference: preferences.theme_preference });
      }
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Unable to save preferences.");
    } finally {
      setSaving(false);
    }
  }

  return {
    themePreference,
    resolvedTheme,
    setThemePreference: persistThemePreference,
    cycleThemePreference: () => persistThemePreference(nextThemePreference(themePreference)),
    saving,
    saveError,
  };
}