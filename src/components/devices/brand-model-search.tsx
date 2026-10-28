"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { useI18n } from "@/components/i18n/locale-provider";
import { normalizeSearch } from "@/lib/utils";

/**
 * Search field above a brand's model list (client request 2026-10-27). It filters the tiles that the
 * server rendered (`[data-model-search]` items inside `#modellen`), so all models stay in the HTML
 * without JavaScript. Every term must start a word, like the device finder's search.
 */
export function BrandModelSearch({ brandName }: { brandName: string }) {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [count, setCount] = useState<number | null>(null);

  function filter(value: string) {
    setQuery(value);
    const root = document.getElementById("modellen");
    if (!root) return;
    const terms = normalizeSearch(value).split(" ").filter(Boolean);
    let shown = 0;
    root.querySelectorAll<HTMLElement>("[data-model-search]").forEach((item) => {
      const words = normalizeSearch(item.dataset.modelSearch ?? "").split(" ");
      const match = terms.every((term) => words.some((w) => w.startsWith(term)));
      item.hidden = !match;
      if (match) shown++;
    });
    // Hide series and sections that have no visible model left.
    root.querySelectorAll<HTMLElement>("[data-model-group]").forEach((group) => {
      group.hidden = !group.querySelector("[data-model-search]:not([hidden])");
    });
    setCount(terms.length ? shown : null);
  }

  return (
    <div className="w-full max-w-md">
      <label className="relative block">
        <span className="sr-only">{t(`Zoek een ${brandName} model`, `Search a ${brandName} model`)}</span>
        <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => filter(e.target.value)}
          placeholder={t(`Zoek je ${brandName} model`, `Search your ${brandName} model`)}
          className="h-12 w-full rounded-full border border-line bg-surface pr-4 pl-12 text-base text-ink outline-none placeholder:text-muted/80 focus:border-accent focus:ring-4 focus:ring-accent/10"
        />
      </label>
      <p aria-live="polite" className="mt-2 min-h-5 text-sm text-muted">
        {count === null
          ? ""
          : count === 0
            ? t("Geen model gevonden. Neem contact op, dan kijken we graag mee.", "No model found. Get in touch and we'll gladly take a look.")
            : t(`${count} ${count === 1 ? "model" : "modellen"} gevonden`, `${count} ${count === 1 ? "model" : "models"} found`)}
      </p>
    </div>
  );
}
