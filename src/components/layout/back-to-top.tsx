"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useI18n } from "@/components/i18n/locale-provider";
import { cn } from "@/lib/utils";

/**
 * Small "back to top" button (client request, 2026-10-15; on iPhone and iPad too since 2026-10-27),
 * bottom right above the WhatsApp button.
 */
export function BackToTop() {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 800);
    const frame = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <button
      type="button"
      onClick={() => {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      }}
      aria-label={t("Terug naar boven", "Back to top")}
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      className={cn(
        "fixed right-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-30 grid size-10 place-items-center rounded-full bg-surface text-ink shadow-[var(--shadow-soft)] ring-1 ring-line transition-[opacity,transform] hover:text-accent-strong md:right-8 md:bottom-[5.75rem] motion-reduce:transition-none",
        visible ? "opacity-100" : "pointer-events-none translate-y-2 opacity-0",
      )}
    >
      <ArrowUp className="size-[1.125rem]" aria-hidden />
    </button>
  );
}
