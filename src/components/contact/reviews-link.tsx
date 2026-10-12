import { ArrowUpRight, Star } from "lucide-react";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Points visitors to the reviews on the Google Business profile.
 * Deliberately shows no score or count: those would have to come from a verified source.
 */
export function ReviewsBanner({ className }: { className?: string }) {
  const reviews = site.reviews;
  if (!reviews) return null;
  return (
    <div
      className={cn(
        "glass-dark flex flex-col gap-6 rounded-[var(--radius-card)] p-7 sm:flex-row sm:items-center sm:justify-between lg:p-8",
        className,
      )}
    >
      <div className="flex items-start gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/10 text-accent-light">
          <Star className="size-6" aria-hidden />
        </span>
        <div>
          <h3 className="text-lg font-semibold tracking-tight">Wat klanten zeggen</h3>
          <p className="mt-1 max-w-xl leading-relaxed text-neutral-400">
            Lees de ervaringen van klanten op {reviews.platform}. Ben je zelf geholpen? Laat daar ook een review achter.
          </p>
        </div>
      </div>
      <a
        href={reviews.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-white px-6 font-medium text-ink transition-colors hover:bg-white/90"
      >
        Bekijk reviews op {reviews.platform}
        <ArrowUpRight className="size-4" aria-hidden />
      </a>
    </div>
  );
}

/** Compact text link for light surfaces (contact details, device pages). */
export function ReviewsLink({ className }: { className?: string }) {
  const reviews = site.reviews;
  if (!reviews) return null;
  return (
    <a
      href={reviews.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("inline-flex items-center gap-1.5 font-medium text-accent-strong hover:text-accent", className)}
    >
      <Star className="size-4" aria-hidden />
      Reviews op {reviews.platform}
      <ArrowUpRight className="size-4" aria-hidden />
    </a>
  );
}
