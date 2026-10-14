"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/components/i18n/locale-provider";

/** Fired by the WhatsApp widget on mobile instead of opening its panel. */
export const WHATSAPP_NOTIFY_EVENT = "pr-whatsapp-notify";

/**
 * Notification bullet on the WhatsApp button of the mobile bar (client request 2026-10-14:
 * on mobile a bullet instead of the chat panel opening by itself). Gone once tapped.
 */
export function WhatsAppNotifyDot() {
  const { t } = useI18n();
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const show = () => setShown(true);
    const hide = () => setShown(false);
    const button = ref.current?.closest("a");
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
        <span className="absolute -top-1.5 right-3 grid size-5 animate-fade-up place-items-center rounded-full bg-danger text-[0.6875rem] font-bold text-white ring-2 ring-surface motion-reduce:animate-none">
          1<span className="sr-only">{t(" nieuw bericht: stuur ons een WhatsApp", " new message: send us a WhatsApp")}</span>
        </span>
      )}
    </span>
  );
}
