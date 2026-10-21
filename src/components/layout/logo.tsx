"use client";

import Image from "next/image";
import { Link } from "@/components/i18n/link";
import { useI18n } from "@/components/i18n/locale-provider";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-8", className)} aria-hidden>
      {/* Placeholder mark in the house green until the official logo file is supplied. */}
      <rect width="32" height="32" rx="9" fill="var(--color-accent)" />
      <rect
        x="10.5"
        y="6.5"
        width="11"
        height="19"
        rx="3"
        fill="none"
        stroke="#fff"
        strokeWidth="1.8"
      />
      <rect x="14" y="9" width="4" height="1.6" rx="0.8" fill="#fff" />
      <circle
        cx="24.5"
        cy="24.5"
        r="3.5"
        fill="#fff"
        stroke="var(--color-accent)"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function Logo({
  tone = "dark",
  className,
  onClick,
}: {
  tone?: "dark" | "light";
  className?: string;
  onClick?: () => void;
}) {
  const { locale, t } = useI18n();
  // On the homepage itself a link to "/" changes nothing visible (client report 2026-10-18): start over at the
  // top, with a fresh device finder when it holds a selection in the URL.
  const home = locale === "en" ? "/en" : "/";
  const onHomeClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    onClick?.();
    if (window.location.pathname !== home || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    if (window.location.search) window.location.assign(home);
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <Link
      href="/"
      onClick={onHomeClick}
      className={cn(
        "group inline-flex shrink-0 items-center gap-2.5 rounded-lg",
        className,
      )}
      aria-label={t(
        "Phone Repairs, naar de homepage",
        "Phone Repairs, go to the homepage",
      )}
    >
      {site.logo ? (
        <>
          <Image
            src={
              tone === "light" && site.logo.light
                ? site.logo.light
                : site.logo.src
            }
            alt={site.name}
            width={site.logo.width}
            height={site.logo.height}
            priority
            unoptimized
            className={cn(
              "h-9 w-auto max-w-none shrink-0 xl:h-11",
              tone === "dark" && site.logo.light && "dark:hidden",
            )}
          />
          {/* Dark theme: the version with the white wordmark. */}
          {tone === "dark" && site.logo.light && (
            <Image
              src={site.logo.light}
              alt={site.name}
              width={site.logo.width}
              height={site.logo.height}
              unoptimized
              className="hidden h-9 w-auto max-w-none shrink-0 xl:h-11 dark:block"
            />
          )}
        </>
      ) : (
        <>
          <LogoMark />
          <span
            className={cn(
              "text-[1.0625rem] font-bold tracking-[-0.01em] whitespace-nowrap",
              tone === "dark" ? "text-ink" : "text-white",
            )}
          >
            Phone{" "}
            <span
              className={tone === "dark" ? "text-accent" : "text-accent-light"}
            >
              Repairs
            </span>
          </span>
        </>
      )}
    </Link>
  );
}
