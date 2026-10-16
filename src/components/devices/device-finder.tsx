"use client";

import { Link } from "@/components/i18n/link";
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
  MessageCircle,
  Phone,
  Search,
  SearchX,
  Timer,
} from "lucide-react";
import Image from "next/image";
import { DeviceArt } from "@/components/devices/device-art";
import { categoryPhoto, DevicePhoto } from "@/components/devices/device-photo";
import { ContentIcon } from "@/components/repairs/icon";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/i18n/locale-provider";
import type { FinderDevice } from "@/lib/catalog";
import { cn, formatEuro, normalizeSearch } from "@/lib/utils";

export type FinderCategory = { id: string; name: string; plural: string; description: string };
export type FinderBrand = {
  id: string;
  name: string;
  categories: string[];
  /** Name per category: Apple shows as iPhone, iPad and MacBook. */
  labels: Record<string, string>;
  /** Logo path (24×24) or null for brands with only a wordmark. */
  mark: string | null;
};

const brandName = (b: FinderBrand, categoryId?: string) => (categoryId && b.labels[categoryId]) || b.name;

function Mark({ brand, className }: { brand: FinderBrand; className?: string }) {
  if (!brand.mark) return null;
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={cn("shrink-0 fill-current", className)}>
      <path d={brand.mark} />
    </svg>
  );
}
export type FinderRepair = {
  id: string;
  name: string;
  summary: string;
  icon: string;
  categories: string[];
  advice: string[];
};
export type FinderContact = {
  phoneDisplay: string;
  phoneHref: string;
  email: string;
  /** International number without "+" for wa.me links; null hides WhatsApp. */
  whatsappNumber: string | null;
};

function whatsappLink(contact: FinderContact, text: string) {
  return contact.whatsappNumber ? `https://wa.me/${contact.whatsappNumber}?text=${encodeURIComponent(text)}` : null;
}

type Selection = { category?: string; brand?: string; device?: string; repair?: string };
type Step = "category" | "brand" | "model" | "repair" | "result";

const STEPS: { id: Step; label: string; labelEn: string }[] = [
  { id: "category", label: "Toestel", labelEn: "Device" },
  { id: "brand", label: "Merk", labelEn: "Brand" },
  { id: "model", label: "Model", labelEn: "Model" },
  { id: "repair", label: "Reparatie", labelEn: "Repair" },
  { id: "result", label: "Prijs", labelEn: "Price" },
];

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
  const { t } = useI18n();
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

  /** Back to an earlier step, keeping the choices made before it. */
  const goToStep = (target: Step) => {
    if (target === "category") update({});
    else if (target === "brand") update({ category: sel.category });
    else if (target === "model") update({ category: sel.category, brand: sel.brand });
    else if (target === "repair") update({ ...sel, repair: undefined });
  };

  const chooseDevice = (id: string) => {
    const d = deviceById.get(id);
    if (d) update({ category: d.categoryId, brand: d.brandId, device: d.id });
  };

  const crumbs = [
    category && { label: category.plural, onClick: () => update({ category: sel.category }) },
    brand && { label: brandName(brand, sel.category), onClick: () => update({ category: sel.category, brand: sel.brand }) },
    device && { label: device.name, onClick: () => update({ ...sel, repair: undefined }) },
    repair && { label: repair.name, onClick: undefined },
  ].filter(Boolean) as { label: string; onClick?: () => void }[];

  const headings: Record<Step, string> = {
    category: t("Wat wil je laten repareren?", "What needs repairing?"),
    brand: t(
      `Welk merk ${category?.name.toLowerCase() ?? "toestel"} heb je?`,
      `Which ${category?.name.toLowerCase() ?? "device"} brand do you have?`,
    ),
    model: t(
      `Welk ${brand ? brandName(brand, sel.category) : ""} model heb je?`,
      `Which ${brand ? brandName(brand, sel.category) : ""} model do you have?`,
    ),
    repair: t(`Wat is er mis met je ${device?.name ?? "toestel"}?`, `What's wrong with your ${device?.name ?? "device"}?`),
    result: t(
      `${repair?.name ?? "Reparatie"} voor je ${device?.name ?? "toestel"}`,
      `${repair?.name ?? "Repair"} for your ${device?.name ?? "device"}`,
    ),
  };

  return (
    <div className="glass overflow-hidden rounded-[var(--radius-panel)]">
      {/* Progress */}
      <div className="flex items-center justify-between gap-4 border-b border-white/80 bg-surface/50 px-5 py-4 sm:px-8">
        <ol className="hidden items-center gap-2 md:flex" aria-label={t("Stappen", "Steps")}>
          {STEPS.map((s, i) => {
            const done = i < stepIndex;
            const content = (
              <>
                <span
                  className={cn(
                    "grid size-6 place-items-center rounded-full text-xs font-medium",
                    i === stepIndex ? "bg-white/15" : done ? "bg-accent-soft text-accent" : "bg-mist",
                  )}
                >
                  {done ? <Check className="size-3.5" aria-hidden /> : i + 1}
                </span>
                {t(s.label, s.labelEn)}
              </>
            );
            const base = "flex items-center gap-2 rounded-full py-1 pr-3 pl-1 text-sm transition-colors";
            return (
            <li key={s.id} className="flex items-center gap-2">
              {/* Completed steps are buttons: click to go back to that step (client request). */}
              {done ? (
                <button
                  type="button"
                  onClick={() => goToStep(s.id)}
                  className={cn(base, "text-ink hover:bg-accent-soft")}
                  aria-label={t(`Terug naar stap ${i + 1}: ${s.label}`, `Back to step ${i + 1}: ${s.labelEn}`)}
                >
                  {content}
                </button>
              ) : (
                <span
                  className={cn(base, i === stepIndex ? "bg-night text-white" : "text-muted")}
                  aria-current={i === stepIndex ? "step" : undefined}
                >
                  {content}
                </span>
              )}
              {i < STEPS.length - 1 && <span className="h-px w-4 bg-line" aria-hidden />}
            </li>
            );
          })}
        </ol>
        <p className="text-sm text-muted md:hidden">
          {t("Stap", "Step")} {stepIndex + 1} {t("van", "of")} {STEPS.length} ·{" "}
          <span className="text-ink">{t(STEPS[stepIndex].label, STEPS[stepIndex].labelEn)}</span>
        </p>
        {step !== "category" && (
          <Button variant="ghost" size="sm" onClick={goBack} className="-mr-2">
            <ArrowLeft aria-hidden />
            {t("Terug", "Back")}
          </Button>
        )}
      </div>

      <div className="px-5 py-7 sm:px-8 sm:py-9">
        {crumbs.length > 0 && (
          <nav aria-label={t("Jouw keuze", "Your selection")} className="mb-4">
            <ol className="flex flex-wrap items-center gap-1 text-sm">
              <li>
                <button type="button" onClick={() => update({})} className="rounded-md text-muted hover:text-ink">
                  {t("Alle toestellen", "All devices")}
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
                    return (
                      <ChoiceCard
                        key={c.id}
                        onClick={() => update({ category: c.id })}
                        className="flex-row p-0 sm:flex-col"
                      >
                        <div className="relative flex h-auto w-24 shrink-0 items-center justify-center tone-light overflow-hidden border-line bg-white p-2 max-sm:border-r sm:h-36 sm:w-auto sm:border-b sm:p-4">
                          <Image
                            src={categoryPhoto(c.id)}
                            alt=""
                            sizes="(min-width: 640px) 16rem, 6rem"
                            className="h-full max-h-20 w-full object-contain transition-transform duration-500 group-hover:scale-[1.04] sm:max-h-none"
                          />
                        </div>
                        <div className="flex flex-1 items-center justify-between gap-3 p-4 sm:p-5">
                          <span>
                            <span className="block font-medium text-ink">{c.plural}</span>
                            <span className="mt-0.5 block text-sm text-muted">{c.description}</span>
                          </span>

                        </div>
                      </ChoiceCard>
                    );
                  })}
                </div>
                <div>
                  <p className="mb-3 text-sm text-muted">{t("Of zoek direct op modelnaam", "Or search by model name")}</p>
                  <ModelSearch
                    devices={devices}
                    brands={brands}
                    onSelect={chooseDevice}
                    placeholder={t("Bijvoorbeeld iPhone 15 Pro of Galaxy S23", "For example iPhone 15 Pro or Galaxy S23")}
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
                    return (
                      <ChoiceCard key={b.id} onClick={() => update({ category: category.id, brand: b.id })}>
                        <span className="flex items-center gap-2.5 text-lg font-semibold tracking-tight text-ink">
                          <Mark brand={b} className="size-5" />
                          {brandName(b, category.id)}
                        </span>
                        <span className="mt-6 flex items-center justify-end text-sm text-muted">
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
                placeholder={t(
                  `Zoek een ${brandName(brand, category.id)} model`,
                  `Search for a ${brandName(brand, category.id)} model`,
                )}
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
              <FinderResult
                device={device}
                repair={repair}
                contact={contact}
                brandName={(() => {
                  const b = brands.find((x) => x.id === device.brandId);
                  return b ? brandName(b, device.categoryId) : undefined;
                })()}
              />
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
        "group flex h-full w-full flex-col items-stretch justify-start overflow-hidden rounded-[var(--radius-card)] bg-surface p-5 text-left ring-1 ring-line transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)] hover:ring-line-strong focus-visible:ring-2 focus-visible:ring-accent",
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
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const brandById = useMemo(() => new Map(brands.map((b) => [b.id, b])), [brands]);
  const labelOf = useCallback(
    (d: FinderDevice) => {
      const b = brandById.get(d.brandId);
      return b ? brandName(b, d.categoryId) : "";
    },
    [brandById],
  );
  const showList = !dropdown || query.trim().length > 0;

  const groups = useMemo(() => {
    const map = new Map<string, FinderDevice[]>();
    for (const d of devices) {
      const label = labelOf(d);
      const key = !dropdown ? d.series : d.series.startsWith(label) ? d.series : `${label} ${d.series}`.trim();
      map.set(key, [...(map.get(key) ?? []), d]);
    }
    return [...map.entries()];
  }, [devices, dropdown, labelOf]);

  return (
    <Command
      label={t("Zoek je model", "Find your model")}
      loop
      filter={(value, search, keywords) => {
        const haystack = normalizeSearch([value, ...(keywords ?? [])].join(" "));
        const terms = normalizeSearch(search).split(" ").filter(Boolean);
        return terms.every((term) => haystack.includes(term)) ? 1 : 0;
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
          className="h-14 w-full rounded-2xl border border-line bg-surface pr-4 pl-12 text-base text-ink outline-none placeholder:text-muted/80 focus:border-accent focus:bg-surface focus:ring-4 focus:ring-accent/10"
        />
      </div>
      {/* Always mounted so the input's aria-controls points at an existing list. */}
      <Command.List
          hidden={!showList}
          className={cn(
            "mt-3 max-h-[26rem] overflow-y-auto overscroll-contain rounded-2xl bg-surface ring-1 ring-line [scrollbar-width:thin]",
            dropdown && "bg-surface shadow-[var(--shadow-lift)]",
          )}
        >
          <Command.Empty className="flex flex-col items-center px-6 py-10 text-center">
            <SearchX className="size-8 text-line-strong" aria-hidden />
            <p className="mt-3 font-medium text-ink">
              {t("Geen model gevonden voor", "No model found for")} “{query}”
            </p>
            <p className="mt-1 max-w-sm text-sm text-muted">
              {t(
                "Staat je toestel er niet tussen? Neem contact op, dan kijken we of een reparatie mogelijk is.",
                "Device not listed? Get in touch and we'll check whether we can repair it.",
              )}
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {contact.whatsappNumber && (
                <Button asChild size="sm">
                  <a
                    href={whatsappLink(
                      contact,
                      t(`Hoi Phone Repairs, kunnen jullie mijn ${query} repareren?`, `Hi Phone Repairs, can you repair my ${query}?`),
                    )!}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle aria-hidden /> {t("WhatsApp ons", "WhatsApp us")}
                  </a>
                </Button>
              )}
              <Button asChild size="sm" variant={contact.whatsappNumber ? "secondary" : "primary"}>
                <a href={contact.phoneHref}>
                  <Phone aria-hidden /> {t("Bel", "Call")} {contact.phoneDisplay}
                </a>
              </Button>
              <Button asChild size="sm" variant="ghost">
                <a href={`mailto:${contact.email}`}>
                  <Mail aria-hidden /> {t("Mail ons", "E-mail us")}
                </a>
              </Button>
            </div>
          </Command.Empty>
          {/* The global search renders its 800+ options only once the visitor types. */}
          {showList && groups.map(([group, items]) => (
            <Command.Group
              key={group}
              heading={group}
              className="px-2 py-2 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:text-muted [&_[cmdk-group-heading]]:uppercase"
            >
              {items.map((d) => (
                <Command.Item
                  key={d.id}
                  value={d.id}
                  keywords={[d.name, ...d.aliases, d.series, labelOf(d), brandById.get(d.brandId)?.name ?? ""]}
                  onSelect={() => onSelect(d.id)}
                  className="group flex cursor-pointer items-center gap-4 rounded-xl px-3 py-1.5 data-[selected=true]:bg-mist"
                >
                  <span className="grid h-11 w-9 shrink-0 place-items-center">
                    <DeviceArt art={d.art} className={d.art === "laptop" ? "w-9" : d.art.startsWith("tablet") || d.art === "phone-foldable" ? "w-7" : "w-[1.15rem]"} />
                  </span>
                  <span className="flex-1">
                    <span className="block text-[0.9375rem] text-ink">
                      {dropdown ? fullName(d, labelOf(d)) : d.name}
                    </span>
                    {d.releaseYear && <span className="block text-xs text-muted">{d.releaseYear}</span>}
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
  brandName,
}: {
  device: FinderDevice;
  repair: FinderRepair;
  contact: FinderContact;
  brandName?: string;
}) {
  const { locale, t } = useI18n();
  const price = device.prices[repair.id];
  const options = device.options[repair.id] ?? 0;
  const appointmentHref = `/afspraak?toestel=${encodeURIComponent(device.id)}&reparatie=${encodeURIComponent(repair.id)}`;
  const devicePageHref = `/reparaties/${device.brandId}/${device.slug}`;
  const whatsapp = whatsappLink(
    contact,
    t(
      `Hoi Phone Repairs, ik wil graag een afspraak maken voor mijn ${fullName(device, brandName)}: ${repair.name.toLowerCase()}.`,
      `Hi Phone Repairs, I'd like to book an appointment for my ${fullName(device, brandName)}: ${repair.name.toLowerCase()}.`,
    ),
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
      <div className="relative flex min-h-64 items-center justify-center tone-light overflow-hidden rounded-[var(--radius-card)] bg-white px-8 pt-14 pb-8 ring-1 ring-line">
        <div className="relative h-52 w-full">
          <DevicePhoto
            device={device}
            sizes="(min-width: 1024px) 24rem, 80vw"
            className="absolute inset-0"
            artClassName={cn(
              "mx-auto h-full w-auto",
              device.art === "laptop" ? "max-w-72" : device.art.startsWith("tablet") || device.art === "phone-foldable" ? "max-w-44" : "max-w-32",
            )}
          />
        </div>
        <span className="absolute top-4 left-4 inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1.5 text-sm text-ink shadow-[var(--shadow-ring)]">
          <ContentIcon name={repair.icon} className="size-4 text-accent" />
          {repair.name}
        </span>
      </div>

      <div className="flex flex-col">
        <div className="rounded-[var(--radius-card)] bg-surface p-6 ring-1 ring-line">
          {price !== undefined ? (
            <>
              <p className="text-sm text-muted">
                {options > 1
                  ? t(
                      `${options} opties, afhankelijk van het onderdeel · inclusief montage en btw`,
                      `${options} options, depending on the part · including fitting and VAT`,
                    )
                  : t("Prijs inclusief montage en btw", "Price including fitting and VAT")}
              </p>
              <p className="mt-1 text-5xl font-semibold tracking-tight text-ink tabular-nums">
                {options > 1 && <span className="mr-2 text-2xl font-medium text-muted">{t("vanaf", "from")}</span>}
                {formatEuro(price, locale)}
              </p>
            </>
          ) : (
            <>
              <p className="text-sm text-muted">{t("Prijs", "Price")}</p>
              <p className="mt-1 text-3xl font-semibold tracking-tight text-ink">{t("Op aanvraag", "On request")}</p>
              <p className="mt-3 flex gap-2 text-sm leading-relaxed text-muted">
                <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
                {t(
                  "Voor deze reparatie geldt geen vaste prijs. De actuele prijs hoor je via WhatsApp, telefonisch of per e-mail.",
                  "There is no fixed price for this repair. Ask us for the current price via WhatsApp, phone or e-mail.",
                )}
              </p>
            </>
          )}
          <ul className="mt-6 grid gap-3 border-t border-line pt-5 text-sm text-ink-soft sm:grid-cols-2">
            <li className="flex items-center gap-2">
              <Timer className="size-4 text-accent" aria-hidden /> {t("Vaak klaar binnen 30 minuten", "Often ready within 30 minutes")}
            </li>
            <li className="flex items-center gap-2">
              <Check className="size-4 text-accent" aria-hidden /> {t("Originele onderdelen", "Original parts")}
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

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {whatsapp ? (
            <Button asChild size="lg">
              <a href={whatsapp} target="_blank" rel="noopener noreferrer">
                <MessageCircle aria-hidden />
                {t("Afspraak via WhatsApp", "Book via WhatsApp")}
              </a>
            </Button>
          ) : (
            <Button asChild size="lg">
              <Link href={appointmentHref}>
                {t("Maak een afspraak", "Book an appointment")}
                <ArrowRight aria-hidden />
              </Link>
            </Button>
          )}
          <Button asChild size="lg" variant="secondary">
            <a href={contact.phoneHref}>
              <Phone aria-hidden />
              {t("Bel", "Call")} {contact.phoneDisplay}
            </a>
          </Button>
        </div>
        <p className="mt-3 text-sm text-muted">
          {t(
            "Je bericht staat al klaar, je hoeft het alleen nog te versturen. Liever mailen?",
            "Your message is ready, you only need to send it. Prefer e-mail?",
          )}{" "}
          <a href={`mailto:${contact.email}`} className="font-medium text-accent-strong hover:underline">
            {contact.email}
          </a>
        </p>
        <Link
          href={devicePageHref}
          className="mt-5 inline-flex items-center gap-1 self-start text-sm font-medium text-accent-strong hover:text-accent"
        >
          {options > 1
            ? t(`Bekijk alle ${options} opties en prijzen voor de`, `See all ${options} options and prices for the`)
            : t("Alle reparaties en prijzen voor de", "All repairs and prices for the")}{" "}
          {device.name}
          <ChevronRight className="size-4" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
