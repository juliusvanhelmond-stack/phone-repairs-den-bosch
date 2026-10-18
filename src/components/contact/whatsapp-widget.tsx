"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, X } from "lucide-react";
import { useI18n } from "@/components/i18n/locale-provider";
import { WHATSAPP_NOTIFY_EVENT, WhatsAppNotifyDot } from "@/components/contact/whatsapp-notify";
import { parsePublicPath } from "@/lib/i18n";
import { site, whatsappCopy, whatsappHref, whatsappMessage } from "@/lib/site";
import { cn } from "@/lib/utils";

/** Once dismissed or opened, the panel does not open by itself again in this session. */
const SEEN_KEY = "pr-whatsapp-prompt";

function readSeen() {
  try {
    return sessionStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

function markSeen() {
  try {
    sessionStorage.setItem(SEEN_KEY, "1");
  } catch {
    // Storage blocked: the prompt may show again, which is harmless.
  }
}

/**
 * Floating WhatsApp button with the chat prompt from the current site.
 * The panel never opens by itself: once per session, after the visitor has read part of a page
 * (scroll depth) or stayed a while, a notification bullet appears on the WhatsApp button (the
 * launcher on desktop, the bottom bar on mobile; client requests 2026-10-14 and 2026-10-16).
 * Not on the appointment and contact pages, where the options are already on screen.
 */
export function WhatsAppWidget() {
  const { locale, t } = useI18n();
  const wa = whatsappCopy(locale);
  const href = whatsappHref(locale === "en" ? whatsappMessage({ locale }) : undefined);
  const pathname = parsePublicPath(usePathname()).nlPath;
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const titleId = useId();
  const launcherRef = useRef<HTMLButtonElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);

  const close = useCallback((restoreFocus: boolean) => {
    setOpen(false);
    markSeen();
    if (restoreFocus) launcherRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!wa || pathname === "/afspraak" || pathname === "/contact" || readSeen()) return;
    const depth = pathname === "/" ? 0.55 : 0.4;
    let done = false;
    const show = () => {
      if (done || readSeen()) return;
      done = true;
      markSeen();
      // A notification bullet on the WhatsApp button instead of a panel over the page (mobile and desktop).
      window.dispatchEvent(new Event(WHATSAPP_NOTIFY_EVENT));
    };
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max > 0 && window.scrollY / max >= depth) show();
    };
    const timer = window.setTimeout(show, 25_000);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [wa, pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close(document.activeElement instanceof Node && !!document.getElementById(panelId)?.contains(document.activeElement));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close, panelId]);

  if (!wa || !href) return null;

  return (
    // On mobile the action bar holds the WhatsApp button; the prompt opens just above it.
    <div className="pointer-events-none fixed right-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-40 flex flex-col items-end gap-3 md:right-6 md:bottom-6">
      <div
        id={panelId}
        role="dialog"
        aria-modal="false"
        aria-labelledby={titleId}
        hidden={!open}
        className={cn(
          "pointer-events-auto w-[min(23rem,calc(100vw-2rem))] origin-bottom-right overflow-hidden rounded-[1.75rem] bg-mist shadow-[var(--shadow-lift)] ring-1 ring-line",
          "animate-fade-up motion-reduce:animate-none",
        )}
      >
        <div className="flex items-center justify-between gap-4 bg-accent px-6 py-5 text-white">
          <h2 id={titleId} className="text-lg font-semibold tracking-tight">
            {wa.title}
          </h2>
          <button
            type="button"
            onClick={() => close(true)}
            aria-label={t("Sluiten", "Close")}
            className="grid size-10 shrink-0 place-items-center rounded-full bg-black/25 transition-colors hover:bg-black/40"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
        <div className="px-5 pt-5 pb-5">
          <p className="relative rounded-3xl rounded-bl-md bg-surface px-5 py-4 text-[0.9375rem] leading-relaxed text-ink-soft shadow-[var(--shadow-soft)]">
            {wa.intro}
          </p>
          <div className="mt-5 flex justify-end">
            <a
              ref={ctaRef}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => close(false)}
              className="inline-flex h-13 items-center gap-3 rounded-full bg-accent pr-4 pl-6 font-semibold text-white transition-colors hover:bg-accent-strong"
            >
              Open WhatsApp
              <MessageCircle className="size-6" aria-hidden />
            </a>
          </div>
          <p className="mt-4 text-right text-sm text-muted">
            {t("Of bel", "Or call")}{" "}
            <a href={site.phone.href} className="font-medium text-accent-strong hover:underline">
              {site.phone.display}
            </a>{" "}
            ·{" "}
            <a href={`mailto:${site.email}`} className="font-medium text-accent-strong hover:underline">
              {t("mail ons", "e-mail us")}
            </a>
          </p>
        </div>
      </div>

      <button
        ref={launcherRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? t("WhatsApp-venster sluiten", "Close WhatsApp window") : wa.title}
        onClick={() => {
          if (open) return close(false);
          markSeen();
          setOpen(true);
          requestAnimationFrame(() => ctaRef.current?.focus());
        }}
        className="pointer-events-auto relative hidden size-14 place-items-center rounded-full bg-accent md:grid text-white shadow-[var(--shadow-lift)] ring-4 ring-white/70 transition-[transform,background-color] hover:scale-105 hover:bg-accent-strong motion-reduce:transition-none motion-reduce:hover:scale-100"
      >
        {open ? <X className="size-6" aria-hidden /> : <MessageCircle className="size-7" aria-hidden />}
        <WhatsAppNotifyDot className="-top-1 -right-1" />
      </button>
    </div>
  );
}
