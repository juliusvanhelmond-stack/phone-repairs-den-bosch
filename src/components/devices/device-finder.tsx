"use client";

import Link from "next/link";
import { Command } from "cmdk";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Info,
  Mail,
  Phone,
  Search,
  SearchX,
  Timer,
} from "lucide-react";
import { DeviceArt } from "@/components/devices/device-art";
import { ContentIcon } from "@/components/repairs/icon";
import { Button } from "@/components/ui/button";
import type { FinderDevice } from "@/lib/catalog";
import type { DeviceArt as DeviceArtKind } from "@/types/content";
import { cn, formatEuro, normalizeSearch } from "@/lib/utils";

export type FinderCategory = { id: string; name: string; plural: string; description: string };
export type FinderBrand = { id: string; name: string; categories: string[] };
export type FinderRepair = {
  id: string;
  name: string;
  summary: string;
  icon: string;
  categories: string[];
  advice: string[];
};
export type FinderContact = { phoneDisplay: string; phoneHref: string; email: string };

type Selection = { category?: string; brand?: string; device?: string; repair?: string };
type Step = "category" | "brand" | "model" | "repair" | "result";

const STEPS: { id: Step; label: string }[] = [
  { id: "category", label: "Toestel" },
  { id: "brand", label: "Merk" },
  { id: "model", label: "Model" },
  { id: "repair", label: "Reparatie" },
  { id: "result", label: "Prijs" },
];

const CATEGORY_ART: Record<string, DeviceArtKind> = {
  smartphone: "phone-island",
  tablet: "tablet",
  laptop: "laptop",
};

const PARAMS = { category: "categorie", brand: "merk", device: "model", repair: "reparatie" } as const;

function stepFor(sel: Selection): Step {
  if (!sel.category) return "category";
  if (!sel.brand) return "brand";
  if (!sel.device) return "model";
  if (!sel.repair) return "repair";
  return "result";
}

export function DeviceFinder({
  categories,
  brands,
  repairs,
  devices,
  contact,
}: {
  categories: FinderCategory[];
  brands: FinderBrand[];
  repairs: FinderRepair[];
  devices: FinderDevice[];
  contact: FinderContact;
}) {
  const [sel, setSel] = useState<Selection>({});
  const step = stepFor(sel);
  const stepIndex = STEPS.findIndex((s) => s.id === step);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [dirty, setDirty] = useState(false);
  const reduce = useReducedMotion();

  const deviceById = useMemo(() => new Map(devices.map((d) => [d.id, d])), [devices]);
  const category = categories.find((c) => c.id === sel.category);
  const brand = brands.find((b) => b.id === sel.brand);
  const device = sel.device ? deviceById.get(sel.device) : undefined;
  const repair = repairs.find((r) => r.id === sel.repair);

  // Restore a shared/deep-linked selection from the URL once on mount.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const next: Selection = {};
    const c = params.get(PARAMS.category);
    const b = params.get(PARAMS.brand);
    const d = params.get(PARAMS.device);
    const r = params.get(PARAMS.repair);
    const dev = d ? deviceById.get(d) : undefined;
    if (dev) {
      next.category = dev.categoryId;
      next.brand = dev.brandId;
      next.device = dev.id;
      if (r && dev.repairs.includes(r)) next.repair = r;
    } else {
      if (c && categories.some((x) => x.id === c)) next.category = c;
      if (next.category && b && brands.some((x) => x.id === b && x.categories.includes(next.category!)))
        next.brand = b;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from the URL on mount
    if (Object.keys(next).length) setSel(next);
  }, [brands, categories, deviceById]);

  // Keep the URL shareable without adding history entries for each step.
  useEffect(() => {
    if (!dirty) return;
    const url = new URL(window.location.href);
    for (const [key, param] of Object.entries(PARAMS)) {
      const value = sel[key as keyof Selection];
      if (value) url.searchParams.set(param, value);
      else url.searchParams.delete(param);
    }
    window.history.replaceState(window.history.state, "", url);
    headingRef.current?.focus({ preventScroll: true });
  }, [sel, dirty]);

  const update = useCallback((next: Selection) => {
    setDirty(true);
    setSel(next);
  }, []);

  const goBack = () => {
    if (sel.repair) update({ ...sel, repair: undefined });
    else if (sel.device) update({ category: sel.category, brand: sel.brand });
    else if (sel.brand) update({ category: sel.category });
    else update({});
  };

  const chooseDevice = (id: string) => {
    const d = deviceById.get(id);
    if (d) update({ category: d.categoryId, brand: d.brandId, device: d.id });
  };

  const crumbs = [
    category && { label: category.plural, onClick: () => update({ category: sel.category }) },
    brand && { label: brand.name, onClick: () => update({ category: sel.category, brand: sel.brand }) },
    device && { label: device.name, onClick: () => update({ ...sel, repair: undefined }) },
    repair && { label: repair.name, onClick: undefined },
  ].filter(Boolean) as { label: string; onClick?: () => void }[];

  const headings: Record<Step, string> = {
    category: "Wat wil je laten repareren?",
    brand: `Welk merk ${category?.name.toLowerCase() ?? "toestel"} heb je?`,
    model: `Welk ${brand?.name ?? ""} model heb je?`,
    repair: `Wat is er mis met je ${device?.name ?? "toestel"}?`,
    result: `${repair?.name ?? "Reparatie"} voor je ${device?.name ?? "toestel"}`,
  };

  return (
    <div className="overflow-hidden rounded-[var(--radius-panel)] bg-white shadow-[var(--shadow-lift)] ring-1 ring-line">
      {/* Progress */}
      <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4 sm:px-8">
        <ol className="hidden items-center gap-2 md:flex" aria-label="Stappen">
          {STEPS.map((s, i) => (
            <li key={s.id} className="flex items-center gap-2">
              <span
                className={cn(
                  "flex items-center gap-2 rounded-full py-1 pr-3 pl-1 text-sm transition-colors",
                  i === stepIndex ? "bg-ink text-white" : i < stepIndex ? "text-ink" : "text-muted",
                )}
                aria-current={i === stepIndex ? "step" : undefined}
              >
                <span
                  className={cn(
                    "grid size-6 place-items-center rounded-full text-xs font-medium",
                    i === stepIndex ? "bg-white/15" : i < stepIndex ? "bg-accent-soft text-accent" : "bg-mist",
                  )}
                >
                  {i < stepIndex ? <Check className="size-3.5" aria-hidden /> : i + 1}
                </span>
                {s.label}
              </span>
              {i < STEPS.length - 1 && <span className="h-px w-4 bg-line" aria-hidden />}
            </li>
          ))}
        </ol>
        <p className="text-sm text-muted md:hidden">
          Stap {stepIndex + 1} van {STEPS.length} · <span className="text-ink">{STEPS[stepIndex].label}</span>
        </p>
        {step !== "category" && (
          <Button variant="ghost" size="sm" onClick={goBack} className="-mr-2">
            <ArrowLeft aria-hidden />
            Terug
          </Button>
        )}
      </div>

      <div className="px-5 py-7 sm:px-8 sm:py-9">
        {crumbs.length > 0 && (
          <nav aria-label="Jouw keuze" className="mb-4">
            <ol className="flex flex-wrap items-center gap-1 text-sm">
              <li>
                <button type="button" onClick={() => update({})} className="rounded-md text-muted hover:text-ink">
                  Alle toestellen
                </button>
              </li>
              {crumbs.map((c, i) => (
                <li key={c.label} className="flex items-center gap-1">
                  <ChevronRight className="size-3.5 text-line-strong" aria-hidden />
                  {c.onClick && i < crumbs.length - 1 ? (
                    <button type="button" onClick={c.onClick} className="rounded-md text-muted hover:text-ink">
                      {c.label}
                    </button>
                  ) : (
                    <span className="text-ink">{c.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        <h3
          ref={headingRef}
          tabIndex={-1}
          aria-live="polite"
          className="text-title font-semibold text-balance text-ink outline-none"
        >
          {headings[step]}
        </h3>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6"
          >
            {step === "category" && (
              <div className="space-y-8">
                <div className="grid gap-3 sm:grid-cols-3">
                  {categories.map((c) => {
                    const count = devices.filter((d) => d.categoryId === c.id).length;
                    return (
                      <ChoiceCard
                        key={c.id}
                        onClick={() => update({ category: c.id })}
                        className="flex-row p-0 sm:flex-col"
                      >
                        <div className="flex h-auto w-24 shrink-0 items-end justify-center overflow-hidden bg-mist px-3 pt-4 sm:h-36 sm:w-auto sm:px-6 sm:pt-6">
                          <DeviceArt
                            art={CATEGORY_ART[c.id] ?? "phone-island"}
                            className={cn(
                              "translate-y-3 transition-transform duration-500 group-hover:translate-y-1 sm:translate-y-6 sm:group-hover:translate-y-3",
                              c.id === "laptop" ? "w-20 sm:w-48" : c.id === "tablet" ? "w-14 sm:w-28" : "w-9 sm:w-[4.5rem]",
                            )}
                          />
                        </div>
                        <div className="flex flex-1 items-center justify-between gap-3 p-4 sm:p-5">
                          <span>
                            <span className="block font-medium text-ink">{c.plural}</span>
                            <span className="mt-0.5 block text-sm text-muted">{c.description}</span>
                          </span>
                          <span className="hidden shrink-0 text-xs text-muted tabular-nums sm:inline">{count} modellen</span>
                        </div>
                      </ChoiceCard>
                    );
                  })}
                </div>
                <div>
                  <p className="mb-3 text-sm text-muted">Of zoek direct op modelnaam</p>
                  <ModelSearch
                    devices={devices}
                    brands={brands}
                    onSelect={chooseDevice}
                    placeholder="Bijvoorbeeld iPhone 15 Pro of Galaxy S23"
                    contact={contact}
                    dropdown
                  />
                </div>
              </div>
            )}

            {step === "brand" && category && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {brands
                  .filter((b) => b.categories.includes(category.id))
                  .map((b) => {
                    const count = devices.filter((d) => d.brandId === b.id && d.categoryId === category.id).length;
                    return (
                      <ChoiceCard key={b.id} onClick={() => update({ category: category.id, brand: b.id })}>
                        <span className="block text-lg font-semibold tracking-tight text-ink">{b.name}</span>
                        <span className="mt-6 flex items-center justify-between text-sm text-muted">
                          {count} modellen
                          <ArrowRight
                            className="size-4 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100"
                            aria-hidden
                          />
                        </span>
                      </ChoiceCard>
                    );
                  })}
              </div>
            )}

            {step === "model" && category && brand && (
              <ModelSearch
                devices={devices.filter((d) => d.brandId === brand.id && d.categoryId === category.id)}
                brands={brands}
                onSelect={chooseDevice}
                placeholder={`Zoek een ${brand.name} model`}
                contact={contact}
                autoFocus
              />
            )}

            {step === "repair" && device && (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {repairs
                  .filter((r) => device.repairs.includes(r.id))
                  .map((r) => (
                    <ChoiceCard key={r.id} onClick={() => update({ ...sel, repair: r.id })}>
                      <span className="grid size-11 place-items-center rounded-xl bg-mist text-ink ring-1 ring-line transition-colors group-hover:bg-accent group-hover:text-white group-hover:ring-accent">
                        <ContentIcon name={r.icon} className="size-5" />
                      </span>
                      <span className="mt-5 block font-medium text-ink">{r.name}</span>
                      <span className="mt-1 block text-sm leading-relaxed text-muted">{r.summary}</span>
                    </ChoiceCard>
                  ))}
              </div>
            )}

            {step === "result" && device && repair && (
              <FinderResult device={device} repair={repair} contact={contact} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/** "Galaxy S23" → "Samsung Galaxy S23"; Apple and already-prefixed names stay as-is. */
function fullName(d: FinderDevice, brand?: string) {
  if (!brand || d.brandId === "apple" || d.name.startsWith(brand)) return d.name;
  return `${brand} ${d.name}`;
}

function ChoiceCard({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex h-full w-full flex-col items-stretch justify-start overflow-hidden rounded-[var(--radius-card)] bg-white p-5 text-left ring-1 ring-line transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)] hover:ring-line-strong focus-visible:ring-2 focus-visible:ring-accent",
        className,
      )}
    >
      {children}
    </button>
  );
}

function ModelSearch({
  devices,
  brands,
  onSelect,
  placeholder,
  contact,
  dropdown = false,
  autoFocus = false,
}: {
  devices: FinderDevice[];
  brands: FinderBrand[];
  onSelect: (id: string) => void;
  placeholder: string;
  contact: FinderContact;
  dropdown?: boolean;
  autoFocus?: boolean;
}) {
  const [query, setQuery] = useState("");
  const brandName = useMemo(() => new Map(brands.map((b) => [b.id, b.name])), [brands]);
  const showList = !dropdown || query.trim().length > 0;

  const groups = useMemo(() => {
    const map = new Map<string, FinderDevice[]>();
    for (const d of devices) {
      const key = dropdown ? `${brandName.get(d.brandId)} ${d.series === brandName.get(d.brandId) ? "" : d.series}`.trim() : d.series;
      map.set(key, [...(map.get(key) ?? []), d]);
    }
    return [...map.entries()];
  }, [devices, dropdown, brandName]);

  return (
    <Command
      label="Zoek je model"
      loop
      filter={(value, search, keywords) => {
        const haystack = normalizeSearch([value, ...(keywords ?? [])].join(" "));
        const terms = normalizeSearch(search).split(" ").filter(Boolean);
        return terms.every((t) => haystack.includes(t)) ? 1 : 0;
      }}
      className="relative"
    >
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted" aria-hidden />
        <Command.Input
          value={query}
          onValueChange={setQuery}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="h-14 w-full rounded-2xl border border-line bg-mist pr-4 pl-12 text-base text-ink outline-none placeholder:text-muted/80 focus:border-accent focus:bg-white focus:ring-4 focus:ring-accent/10"
        />
      </div>
      {/* Always mounted so the input's aria-controls points at an existing list. */}
      <Command.List
          hidden={!showList}
          className={cn(
            "mt-3 max-h-[26rem] overflow-y-auto overscroll-contain rounded-2xl ring-1 ring-line [scrollbar-width:thin]",
            dropdown && "bg-white shadow-[var(--shadow-lift)]",
          )}
        >
          <Command.Empty className="flex flex-col items-center px-6 py-10 text-center">
            <SearchX className="size-8 text-line-strong" aria-hidden />
            <p className="mt-3 font-medium text-ink">Geen model gevonden voor “{query}”</p>
            <p className="mt-1 max-w-sm text-sm text-muted">
              Staat je toestel er niet tussen? Neem contact op, dan kijken we of een reparatie mogelijk is.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <Button asChild size="sm">
                <a href={contact.phoneHref}>
                  <Phone aria-hidden /> Bel {contact.phoneDisplay}
                </a>
              </Button>
              <Button asChild size="sm" variant="secondary">
                <a href={`mailto:${contact.email}`}>
                  <Mail aria-hidden /> Mail ons
                </a>
              </Button>
            </div>
          </Command.Empty>
          {groups.map(([group, items]) => (
            <Command.Group
              key={group}
              heading={group}
              className="px-2 py-2 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:text-muted [&_[cmdk-group-heading]]:uppercase"
            >
              {items.map((d) => (
                <Command.Item
                  key={d.id}
                  value={d.id}
                  keywords={[d.name, ...d.aliases, d.series, brandName.get(d.brandId) ?? ""]}
                  onSelect={() => onSelect(d.id)}
                  className="group flex cursor-pointer items-center gap-4 rounded-xl px-3 py-2.5 data-[selected=true]:bg-mist"
                >
                  <span className="grid h-11 w-9 shrink-0 place-items-center">
                    <DeviceArt art={d.art} className={d.art === "laptop" ? "w-9" : d.art.startsWith("tablet") || d.art === "phone-foldable" ? "w-7" : "w-[1.15rem]"} />
                  </span>
                  <span className="flex-1">
                    <span className="block text-[0.9375rem] text-ink">
                      {dropdown ? fullName(d, brandName.get(d.brandId)) : d.name}
                    </span>
                    <span className="block text-xs text-muted">{d.releaseYear}</span>
                  </span>
                  <ChevronRight className="size-4 text-muted opacity-0 group-data-[selected=true]:opacity-100" aria-hidden />
                </Command.Item>
              ))}
            </Command.Group>
          ))}
        </Command.List>
    </Command>
  );
}

function FinderResult({
  device,
  repair,
  contact,
}: {
  device: FinderDevice;
  repair: FinderRepair;
  contact: FinderContact;
}) {
  const price = device.prices[repair.id];
  const appointmentHref = `/afspraak?toestel=${encodeURIComponent(device.id)}&reparatie=${encodeURIComponent(repair.id)}`;
  const devicePageHref = `/reparaties/${device.brandId}/${device.slug}`;

  return (
    <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
      <div className="relative flex items-end justify-center overflow-hidden rounded-[var(--radius-card)] bg-mist px-8 pt-10">
        <DeviceArt
          art={device.art}
          title={device.name}
          className={cn(
            "translate-y-8",
            device.art === "laptop" ? "w-72" : device.art.startsWith("tablet") || device.art === "phone-foldable" ? "w-44" : "w-32",
          )}
        />
        <span className="absolute top-4 left-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm text-ink shadow-[var(--shadow-ring)]">
          <ContentIcon name={repair.icon} className="size-4 text-accent" />
          {repair.name}
        </span>
      </div>

      <div className="flex flex-col">
        <div className="rounded-[var(--radius-card)] p-6 ring-1 ring-line">
          {price !== undefined ? (
            <>
              <p className="text-sm text-muted">Prijs inclusief montage en btw</p>
              <p className="mt-1 text-5xl font-semibold tracking-tight text-ink tabular-nums">{formatEuro(price)}</p>
            </>
          ) : (
            <>
              <p className="text-sm text-muted">Prijs</p>
              <p className="mt-1 text-3xl font-semibold tracking-tight text-ink">Op aanvraag</p>
              <p className="mt-3 flex gap-2 text-sm leading-relaxed text-muted">
                <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
                De actuele prijs voor deze reparatie hoor je telefonisch of per e-mail. In deze demo worden alleen
                prijzen getoond die uit de bestaande website zijn overgenomen.
              </p>
            </>
          )}
          <ul className="mt-6 grid gap-3 border-t border-line pt-5 text-sm text-ink-soft sm:grid-cols-2">
            <li className="flex items-center gap-2">
              <Timer className="size-4 text-accent" aria-hidden /> Vaak klaar binnen 30 minuten
            </li>
            <li className="flex items-center gap-2">
              <Check className="size-4 text-accent" aria-hidden /> Originele onderdelen
            </li>
          </ul>
        </div>

        {repair.advice.length > 0 && (
          <div className="mt-4 flex gap-3 rounded-2xl bg-warning-soft p-4 text-sm text-warning ring-1 ring-amber-200">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
            <ul className="space-y-1">
              {repair.advice.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href={appointmentHref}>
              Maak een afspraak
              <ArrowRight aria-hidden />
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <a href={contact.phoneHref}>
              <Phone aria-hidden />
              {contact.phoneDisplay}
            </a>
          </Button>
        </div>
        <Link
          href={devicePageHref}
          className="mt-5 inline-flex items-center gap-1 self-start text-sm font-medium text-accent hover:text-accent-strong"
        >
          Alle reparaties voor de {device.name}
          <ChevronRight className="size-4" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
