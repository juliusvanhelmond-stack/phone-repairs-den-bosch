"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/components/i18n/locale-provider";

/** Fired by the WhatsApp widget instead of opening its panel by itself. */
export const WHATSAPP_NOTIFY_EVENT = "pr-whatsapp-notify";

/**
 * Notification bullet on the WhatsApp button (client requests: on mobile 2026-10-14, on desktop
 * 2026-10-16 — a bullet instead of the chat panel opening by itself). Gone once tapped.
 */
export function WhatsAppNotifyDot({ className }: { className?: string }) {
  const { t } = useI18n();
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const show = () => setShown(true);
    const hide = () => setShown(false);
    const button = ref.current?.closest("a, button");
    window.addEventListener(WHATSAPP_NOTIFY_EVENT, show);
    button?.addEventListener("click", hide);
    return () => {
      window.removeEventListener(WHATSAPP_NOTIFY_EVENT, show);
      button?.removeEventListener("click", hide);
    };
  }, []);
  return (
    <span ref={ref} className="contents">
      {shown && (
        <span className={`absolute grid size-5 ${className ?? "-top-1.5 right-3"} animate-fade-up place-items-center rounded-full bg-danger text-[0.6875rem] font-bold text-white ring-2 ring-surface motion-reduce:animate-none`}>
          1<span className="sr-only">{t(" nieuw bericht: stuur ons een WhatsApp", " new message: send us a WhatsApp")}</span>
        </span>
      )}
    </span>
  );
}
