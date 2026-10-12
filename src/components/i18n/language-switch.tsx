"use client";

import { usePathname } from "next/navigation";
import { Globe } from "lucide-react";
import { useI18n } from "@/components/i18n/locale-provider";
import { localizePath, parsePublicPath } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Links to the same page in the other language. A plain anchor on purpose: the other
 * language has a different root layout, so the switch is a full page load, and
 * prefetching across root params makes the client router refetch in a loop.
 */
export function LanguageSwitch({ className, onNavigate }: { className?: string; onNavigate?: () => void }) {
  const { locale } = useI18n();
  const pathname = usePathname();
  const target = locale === "nl" ? "en" : "nl";
  const href = localizePath(parsePublicPath(pathname).nlPath, target);
  return (
    <a
      href={href}
      hrefLang={target}
      lang={target}
      onClick={onNavigate}
      aria-label={target === "en" ? "English version of this page" : "Nederlandse versie van deze pagina"}
      className={cn(
        "inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-ink-soft ring-1 ring-line transition-colors hover:bg-mist hover:text-ink",
        className,
      )}
    >
      <Globe className="size-4" aria-hidden />
      {target === "en" ? "EN" : "NL"}
    </a>
  );
}
