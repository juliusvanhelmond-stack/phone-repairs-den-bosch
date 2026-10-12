import { MessageCircle, Phone } from "lucide-react";
import { site, whatsappHref, whatsappMessage } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * In-page version of the WhatsApp prompt (same copy as the floating widget),
 * placed where a visitor is ready to ask or book: device, repair, FAQ and local pages.
 */
export function WhatsAppCard({
  message = whatsappMessage(),
  className,
}: {
  message?: string;
  className?: string;
}) {
  const wa = site.whatsapp;
  const href = whatsappHref(message);
  if (!wa || !href) return null;
  return (
    <aside
      aria-label={wa.title}
      className={cn("overflow-hidden rounded-[1.75rem] bg-mist shadow-[var(--shadow-soft)] ring-1 ring-line", className)}
    >
      <p className="bg-accent px-6 py-5 text-lg font-semibold tracking-tight text-white">{wa.title}</p>
      <div className="p-5 sm:p-6">
        <p className="rounded-3xl rounded-bl-md bg-white px-5 py-4 text-[0.9375rem] leading-relaxed text-ink-soft shadow-[var(--shadow-soft)]">
          {wa.intro}
        </p>
        <div className="mt-5 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
          <a
            href={site.phone.href}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full px-5 font-medium text-ink ring-1 ring-line-strong transition-colors ring-inset hover:bg-white"
          >
            <Phone className="size-4" aria-hidden />
            Bel {site.phone.display}
          </a>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center justify-center gap-3 rounded-full bg-accent pr-4 pl-6 font-semibold text-white transition-colors hover:bg-accent-strong"
          >
            Open WhatsApp
            <MessageCircle className="size-5" aria-hidden />
          </a>
        </div>
      </div>
    </aside>
  );
}
