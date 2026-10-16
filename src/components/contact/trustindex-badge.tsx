"use client";

import { useEffect, useRef } from "react";

/**
 * Trustindex widget (Google reviews: the badge or the review carousel), as on the current site.
 * The loader renders the widget next to its own <script> tag, so the script is
 * inserted into this container on mount. Score and count come from Trustindex.
 */
export function TrustindexBadge({ widgetId, className }: { widgetId: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || el.querySelector("script")) return;
    const script = document.createElement("script");
    script.src = `https://cdn.trustindex.io/loader.js?${widgetId}`;
    script.defer = true;
    script.async = true;
    el.appendChild(script);
    return () => {
      el.replaceChildren();
    };
  }, [widgetId]);

  return <div ref={ref} className={className} data-reviews-badge={widgetId} />;
}
