"use client";

import { Moon, Sun } from "lucide-react";
import { useI18n } from "@/components/i18n/locale-provider";
import { cn } from "@/lib/utils";

const KEY = "pr-theme";

/**
 * Light/dark switch. The theme follows the device until the visitor chooses; choosing the
 * device's own theme again removes the choice, so the site follows the device once more.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { t } = useI18n();
  const toggle = () => {
    const root = document.documentElement;
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try {
      const device = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      if (next === device) localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, next);
    } catch {
      // Storage blocked: the choice lasts for this page only.
    }
  };
  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        "grid size-10 shrink-0 place-items-center rounded-full text-muted ring-1 ring-line transition-colors hover:bg-mist hover:text-ink",
        className,
      )}
    >
      {/* Both icons are rendered; CSS shows the right one, so server and client HTML match. */}
      <Moon className="size-[1.125rem] dark:hidden" aria-hidden />
      <Sun className="hidden size-[1.125rem] dark:block" aria-hidden />
      <span className="sr-only dark:hidden">
        {t("Donkere weergave", "Dark mode")}
      </span>
      <span className="sr-only hidden dark:inline">
        {t("Lichte weergave", "Light mode")}
      </span>
    </button>
  );
}
