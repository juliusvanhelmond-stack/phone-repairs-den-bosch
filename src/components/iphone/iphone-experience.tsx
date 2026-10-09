"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, MousePointer2, Timer, X } from "lucide-react";
import { ExplodedPhone } from "@/components/home/exploded-phone";
import { ContentIcon } from "@/components/repairs/icon";
import { Button } from "@/components/ui/button";
import { cn, formatEuro } from "@/lib/utils";
import { REPAIR_LABELS, REPAIR_ORDER, STAGES, smoothstep, type RepairKey } from "./parts";
import { createExplodeStore, useExplodeUi, type ExplodeStore } from "./store";

const CanvasStage = dynamic(() => import("./canvas-stage"), { ssr: false });

export type RepairInfo = {
  name: string;
  summary: string;
  icon: string;
  detailHref: string;
  bookingHref: string;
  /** Only set when backed by a verified source. */
  price?: number;
  duration?: string;
};

type Mode = "pending" | "webgl" | "fallback";

function supportsWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export function IphoneExperience({
  repairs,
  modelNote,
}: {
  repairs: Record<RepairKey, RepairInfo>;
  /** Shown while the stand-in model is in use (demo mode). */
  modelNote?: string;
}) {
  const store = useMemo(() => createExplodeStore(), []);
  const ui = useExplodeUi(store);
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>("pending");
  const [near, setNear] = useState(false);
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);
  const [compact, setCompact] = useState(false);
  const [reduced, setReduced] = useState(false);

  // Capabilities and preferences (client only).
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const narrow = window.matchMedia("(max-width: 767px)");
    const sync = () => {
      setReduced(motion.matches);
      setCompact(narrow.matches);
      store.setReducedMotion(motion.matches);
    };
    sync();
    motion.addEventListener("change", sync);
    narrow.addEventListener("change", sync);
    // One-time client capability check; cannot be known during server render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMode(supportsWebGL() ? "webgl" : "fallback");
    return () => {
      motion.removeEventListener("change", sync);
      narrow.removeEventListener("change", sync);
    };
  }, [store]);

  // Load the 3D bundle shortly before the section scrolls into view; pause rendering when off-screen.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const nearObs = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: "800px 0px" });
    const visObs = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "100px 0px" });
    nearObs.observe(el);
    visObs.observe(el);
    return () => {
      nearObs.disconnect();
      visObs.disconnect();
    };
  }, []);

  // Scroll → progress (0..1 across the pinned distance). No React state per frame.
  useEffect(() => {
    if (reduced) {
      store.setReducedMotion(true);
      stickyRef.current?.style.setProperty("--p", "1");
      return;
    }
    const frame = { id: 0 };
    const update = () => {
      frame.id = 0;
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const distance = rect.height - window.innerHeight;
      const p = distance > 0 ? Math.min(1, Math.max(0, -rect.top / distance)) : 1;
      store.setProgress(p);
      stickyRef.current?.style.setProperty("--p", p.toFixed(4));
      if (p < STAGES.interactive - 0.05 && store.getUi().selected) store.setSelected(null);
    };
    const onScroll = () => {
      if (!frame.id) frame.id = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame.id);
    };
  }, [reduced, store]);

  // Escape closes the card; focus moves to the card when it opens.
  useEffect(() => {
    if (!ui.selected) return;
    cardRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && store.setSelected(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ui.selected, store]);

  const choose = useCallback(
    (key: RepairKey) => {
      if (store.getUi().selected === key) {
        store.setSelected(null);
        return;
      }
      const el = sectionRef.current;
      if (!reduced && el && store.progress < STAGES.interactive) {
        // Jump to the settled exploded view first, then focus the part.
        const top = el.getBoundingClientRect().top + window.scrollY + el.offsetHeight - window.innerHeight;
        window.scrollTo({ top, behavior: "smooth" });
      }
      store.setSelected(key);
    },
    [reduced, store],
  );

  const selected = ui.selected ? repairs[ui.selected] : null;
  const showWebgl = mode === "webgl" && near;

  return (
    <section
      ref={sectionRef}
      aria-labelledby="iphone-explode-title"
      // Heights via CSS (no layout shift after hydration); reduced motion = no pinned scroll.
      className={cn("relative", mode === "fallback" ? "h-auto" : "h-[250vh] md:h-[300vh] motion-reduce:h-auto md:motion-reduce:h-auto")}
    >
      <div
        ref={stickyRef}
        className={cn(
          "relative isolate overflow-hidden",
          mode === "fallback"
            ? "pb-36"
            : "sticky top-0 h-[100svh] motion-reduce:static motion-reduce:h-auto motion-reduce:pb-36",
        )}
        style={{ ["--p" as string]: "0" }}
      >
        {/* Heading */}
        <div className="pointer-events-none relative z-10 container-page pt-24 lg:pt-28">
          <div className={cn("max-w-xl transition-opacity duration-500", ui.selected && "opacity-25")}>
            <p className="eyebrow mb-3">iPhone reparatie</p>
            <h2 id="iphone-explode-title" className="text-headline font-semibold text-balance text-ink">
              Ontdek wat wij voor jouw iPhone kunnen betekenen.
            </h2>
            <p className="mt-4 max-w-md text-lg leading-relaxed text-pretty text-muted max-sm:text-base">
              Van scherm tot batterij. Ontdek onze reparaties en geef jouw iPhone een tweede leven.
            </p>
          </div>
        </div>

        {/* Stage */}
        <div
          className={cn(
            mode === "fallback"
              ? "relative mt-6 h-[34rem] sm:h-[40rem]"
              : "absolute inset-0 motion-reduce:relative motion-reduce:mt-6 motion-reduce:h-[36rem] motion-reduce:sm:h-[42rem]",
          )}
        >
          {/* Poster / fallback: the existing CSS exploded phone */}
          <div
            className={cn(
              "absolute inset-0 flex items-center justify-center px-6 pt-40 transition-opacity duration-700 sm:pt-24",
              ready && mode === "webgl" ? "opacity-0" : "opacity-100",
            )}
            aria-hidden
          >
            <div className="w-full max-w-sm sm:max-w-md lg:translate-x-24">
              <ExplodedPhone />
            </div>
          </div>
          {showWebgl && (
            <div className={cn("absolute inset-0 transition-opacity duration-1000", ready ? "opacity-100" : "opacity-0")}>
              <CanvasStage store={store} compact={compact} active={visible} onReady={() => setReady(true)} />
              {ready && <LabelsOverlay store={store} compact={compact} active={visible} />}
            </div>
          )}
        </div>

        {/* Scroll hint */}
        {!reduced && mode === "webgl" && (
          <div
            className="pointer-events-none absolute bottom-44 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 text-sm text-muted sm:bottom-40"
            style={{ opacity: "clamp(0, calc(1 - var(--p) * 8), 1)" }}
            aria-hidden
          >
            <MousePointer2 className="size-4" />
            Scroll om het toestel te openen
          </div>
        )}

        {/* Part chooser: always available, also for keyboard and screen readers */}
        <div className="absolute inset-x-0 bottom-0 z-20 pb-5 sm:pb-8">
          <div className="container-page">
            <div
              className="flex flex-col items-center gap-3"
              style={reduced || mode === "fallback" ? undefined : { opacity: "clamp(0.35, calc((var(--p) - 0.55) * 4), 1)" }}
            >
              <p className="text-xs font-medium tracking-wide text-muted uppercase" id="iphone-parts-label">
                Kies een onderdeel
              </p>
              <div
                role="group"
                aria-labelledby="iphone-parts-label"
                className="glass flex max-w-full gap-1 overflow-x-auto rounded-full p-1 [scrollbar-width:none]"
              >
                {REPAIR_ORDER.map((key) => (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={ui.selected === key}
                    onClick={() => choose(key)}
                    onPointerEnter={() => store.setHovered(key)}
                    onPointerLeave={() => !store.getUi().selected && store.setHovered(null)}
                    className={cn(
                      "flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-2 text-[0.8125rem] whitespace-nowrap transition-colors sm:px-4 sm:text-sm",
                      ui.selected === key ? "bg-ink text-white" : "text-ink-soft hover:bg-white hover:text-ink",
                    )}
                  >
                    <ContentIcon name={repairs[key].icon} className="hidden size-4 sm:block" />
                    {REPAIR_LABELS[key].shortLabel}
                  </button>
                ))}
              </div>
              {modelNote && <p className="max-w-md text-center text-[0.6875rem] leading-snug text-muted">{modelNote}</p>}
            </div>
          </div>
        </div>

        {/* Information card */}
        {selected && ui.selected && (
          <div
            ref={cardRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="false"
            aria-labelledby="iphone-card-title"
            className={cn(
              "glass absolute z-30 rounded-[var(--radius-card)] p-6 outline-none animate-fade-up",
              "inset-x-4 bottom-28 sm:inset-x-auto sm:right-6 sm:bottom-auto sm:top-1/2 sm:w-[22rem] sm:-translate-y-1/2 lg:right-[max(1.5rem,calc((100vw-80rem)/2+2rem))]",
            )}
          >
            <button
              type="button"
              onClick={() => store.setSelected(null)}
              className="absolute top-4 right-4 grid size-8 place-items-center rounded-full bg-white/70 text-ink-soft ring-1 ring-line transition-colors hover:bg-white hover:text-ink"
              aria-label="Sluiten"
            >
              <X className="size-4" />
            </button>
            <span className="grid size-11 place-items-center rounded-xl bg-accent text-white">
              <ContentIcon name={selected.icon} className="size-5" />
            </span>
            <h3 id="iphone-card-title" className="mt-4 text-xl font-semibold tracking-tight text-ink">
              {selected.name}
            </h3>
            <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">{selected.summary}</p>
            {(selected.duration || selected.price !== undefined) && (
              <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                {selected.duration && (
                  <div className="flex items-center gap-1.5 text-ink-soft">
                    <Timer className="size-4 text-accent" aria-hidden />
                    <dt className="sr-only">Duur</dt>
                    <dd>{selected.duration}</dd>
                  </div>
                )}
                {selected.price !== undefined && (
                  <div className="text-ink">
                    <dt className="sr-only">Prijs</dt>
                    <dd className="font-semibold">{formatEuro(selected.price)}</dd>
                  </div>
                )}
              </dl>
            )}
            <div className="mt-6 flex flex-col gap-2">
              <Button asChild>
                <Link href={selected.bookingHref}>
                  Plan reparatie
                  <ArrowRight aria-hidden />
                </Link>
              </Button>
              <Link
                href={selected.detailHref}
                className="self-center text-sm font-medium text-accent-strong hover:text-blue-800"
              >
                Meer over deze reparatie
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * Technical annotations drawn in the DOM: a dot on the part, a hairline connector
 * and a small glass label. Positions come from the scene's projected anchors.
 * Decorative for assistive tech: the part chooser offers the same actions.
 */
function LabelsOverlay({ store, compact, active }: { store: ExplodeStore; compact: boolean; active: boolean }) {
  const ui = useExplodeUi(store);
  const refs = useRef<Partial<Record<RepairKey, HTMLDivElement>>>({});
  const lineWidth = compact ? 20 : 56;

  useEffect(() => {
    if (!active) return;
    let id = 0;
    const tick = () => {
      const visibility = smoothstep(STAGES.labelsStart, STAGES.labelsEnd, store.rendered);
      const selected = store.getUi().selected;
      for (const key of REPAIR_ORDER) {
        const el = refs.current[key];
        const pos = store.labels[key];
        if (!el) continue;
        const faded = selected && selected !== key ? 0.2 : 1;
        el.style.opacity = String(pos.visible ? visibility * faded : 0);
        // Keep labels inside the stage on narrow screens.
        const width = el.offsetWidth;
        const bounds = el.parentElement?.clientWidth ?? window.innerWidth;
        const left = REPAIR_LABELS[key].side === "left" ? pos.x - width : pos.x;
        const clampedLeft = Math.min(Math.max(left, 8), bounds - width - 8);
        el.style.transform = `translate3d(${clampedLeft}px, ${pos.y + (1 - visibility) * 8}px, 0) translateY(-50%)`;
        el.style.pointerEvents = visibility > 0.6 ? "auto" : "none";
      }
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [active, store]);

  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden" aria-hidden>
      {REPAIR_ORDER.map((key) => {
        const cfg = REPAIR_LABELS[key];
        const emphasised = ui.hovered === key || ui.selected === key;
        return (
          <div
            key={key}
            ref={(el) => {
              if (el) refs.current[key] = el;
            }}
            className="absolute top-0 left-0 flex items-center will-change-transform"
            style={{ opacity: 0, flexDirection: cfg.side === "left" ? "row-reverse" : "row" }}
          >
            <span
              className={cn(
                "block size-2 shrink-0 rounded-full ring-4 transition-colors",
                cfg.side === "left" ? "-mr-1" : "-ml-1",
                emphasised ? "bg-accent ring-accent/25" : "bg-white ring-white/50",
              )}
              style={{ boxShadow: "0 0 0 1px rgb(37 99 235 / 0.65)" }}
            />
            <span className={cn("block h-px shrink-0 transition-colors", emphasised ? "bg-accent" : "bg-ink/30")} style={{ width: lineWidth }} />
            <button
              type="button"
              tabIndex={-1}
              onPointerEnter={() => store.rendered >= STAGES.interactive && store.setHovered(key)}
              onPointerLeave={() => !store.getUi().selected && store.setHovered(null)}
              onClick={() => store.rendered >= STAGES.interactive && store.setSelected(store.getUi().selected === key ? null : key)}
              className={cn(
                "glass rounded-full font-medium whitespace-nowrap transition-[color,transform] duration-200",
                compact ? "px-2.5 py-1 text-[0.6875rem]" : "px-3.5 py-1.5 text-[0.8125rem]",
                emphasised ? "scale-105 text-accent-strong" : "text-ink",
              )}
            >
              {compact ? cfg.shortLabel : cfg.label}
            </button>
          </div>
        );
      })}
    </div>
  );
}
