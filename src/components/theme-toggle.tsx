"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";

const THEME_KEY = "hacktracker:theme";
const CHANGE_EVENT = "hacktracker:theme-change";

function getTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem(THEME_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getTheme, () => "light" as const);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    window.localStorage.setItem(THEME_KEY, next);
    document.documentElement.classList.toggle("dark", next === "dark");
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }

  return (
    <Button type="button" variant="ghost" size="icon-sm" onClick={toggle} aria-label="Toggle theme">
      {theme === "dark" ? <Sun /> : <Moon />}
    </Button>
  );
}
