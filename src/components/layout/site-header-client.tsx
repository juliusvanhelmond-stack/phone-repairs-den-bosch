"use client";

import { Link } from "@/components/i18n/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Dialog, NavigationMenu, VisuallyHidden } from "radix-ui";
import { ArrowRight, ChevronDown, Mail, Menu, MessageCircle, Phone, Search, X } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import type { NavData } from "@/components/layout/nav-data";
import { mainNav } from "@/components/layout/nav-data";
import { ContentIcon } from "@/components/repairs/icon";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/i18n/locale-provider";
import { LanguageSwitch } from "@/components/i18n/language-switch";
import { parsePublicPath } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type Props = { nav: NavData; phone: { display: string; href: string }; whatsapp: string | null; email: string };

export function SiteHeaderClient({ nav, phone, whatsapp, email }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const { t } = useI18n();
  const pathname = parsePublicPath(usePathname()).nlPath;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-300",
        scrolled
          ? "bg-surface/85 shadow-[0_1px_0_rgb(34_34_34/0.06),0_8px_24px_-16px_rgb(16_111_49/0.14)] backdrop-blur-xl backdrop-saturate-150"
          : "bg-surface/0",
      )}
    >
      <div className="container-page flex h-16 items-center justify-between gap-3 lg:h-[4.5rem] 2xl:gap-6">
        <Logo />

        <NavigationMenu.Root className="static hidden lg:block [&>div]:!static" aria-label={t("Hoofdmenu", "Main menu")}>
          <NavigationMenu.List className="flex items-center gap-0.5 xl:gap-1">
            <NavigationMenu.Item>
              <NavigationMenu.Trigger
                className={cn(
                  "group flex h-10 items-center gap-1 rounded-full px-2.5 text-[0.9375rem] whitespace-nowrap 2xl:px-4 text-ink-soft transition-colors hover:bg-accent-soft hover:text-accent-strong data-[state=open]:bg-accent-soft data-[state=open]:text-accent-strong",
                  pathname.startsWith("/reparatie") && "text-ink",
                )}
              >
                {t("Reparaties", "Repairs")}
                <ChevronDown
                  className="size-3.5 transition-transform duration-200 group-data-[state=open]:rotate-180"
                  aria-hidden
                />
              </NavigationMenu.Trigger>
              <NavigationMenu.Content forceMount className="absolute inset-x-0 top-full data-[state=closed]:hidden px-4 pt-2 sm:px-6 lg:px-8 data-[motion=from-start]:animate-fade-up data-[motion=from-end]:animate-fade-up">
                <MegaMenu nav={nav} />
              </NavigationMenu.Content>
            </NavigationMenu.Item>
            {mainNav.map((item) => (
              <NavigationMenu.Item key={item.href}>
                <NavigationMenu.Link asChild active={pathname === item.href}>
                  <Link
                    href={item.href}
                    className="flex h-10 items-center rounded-full px-2.5 text-[0.9375rem] whitespace-nowrap text-ink-soft 2xl:px-4 transition-colors hover:bg-accent-soft hover:text-accent-strong data-[active]:text-ink"
                  >
                    {t(item.label, item.labelEn)}
                  </Link>
                </NavigationMenu.Link>
              </NavigationMenu.Item>
            ))}
          </NavigationMenu.List>
        </NavigationMenu.Root>

        <div className="flex items-center gap-2">
          <a
            href={phone.href}
            className="hidden h-10 items-center gap-2 rounded-full px-3 text-[0.9375rem] whitespace-nowrap text-ink-soft transition-colors hover:text-accent-strong xl:flex"
          >
            <Phone className="size-4" aria-hidden />
            {phone.display}
          </a>
          {whatsapp ? (
            <Button asChild size="sm" className="hidden h-10 px-5 sm:inline-flex">
              <a href={whatsapp} target="_blank" rel="noopener noreferrer">
                <MessageCircle aria-hidden />
                {t("WhatsApp ons", "WhatsApp us")}
              </a>
            </Button>
          ) : (
            <Button asChild size="sm" className="hidden h-10 px-5 sm:inline-flex">
              <a href={phone.href}>
                <Phone aria-hidden />
                {t("Bel ons", "Call us")}
              </a>
            </Button>
          )}
          <MobileNav nav={nav} phone={phone} whatsapp={whatsapp} email={email} />
        </div>
      </div>
    </header>
  );
}

function MegaMenu({ nav }: { nav: NavData }) {
  const { t } = useI18n();
  return (
    <div className="mx-auto grid max-w-[76rem] gap-2 overflow-hidden rounded-[1.75rem] bg-surface p-2 shadow-[var(--shadow-lift)] ring-1 ring-line lg:grid-cols-[1.2fr_1fr_0.8fr]">
      <div className="space-y-6 p-6">
        {nav.categories.map((cat) => (
          <div key={cat.id}>
            <p className="mb-2.5 text-xs font-medium tracking-wide text-muted uppercase">{cat.name}</p>
            <ul className="flex flex-wrap gap-1.5">
              {cat.brands.map((b) => (
                <li key={b.href}>
                  <NavigationMenu.Link asChild>
                    <Link
                      href={b.href}
                      className="block rounded-full bg-mist px-3.5 py-1.5 text-[0.9375rem] whitespace-nowrap text-ink ring-1 ring-line transition-colors hover:bg-accent hover:text-white hover:ring-accent"
                    >
                      {b.name}
                    </Link>
                  </NavigationMenu.Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-line p-4 lg:border-l">
        <p className="mb-2 px-2 pt-2 text-xs font-medium tracking-wide text-muted uppercase">{t("Reparaties", "Repairs")}</p>
        <ul>
          {nav.repairs.map((r) => (
            <li key={r.href}>
              <NavigationMenu.Link asChild>
                <Link
                  href={r.href}
                  className="group flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-accent-soft"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-mist text-ink ring-1 ring-line transition-colors group-hover:bg-surface group-hover:text-accent-strong">
                    <ContentIcon name={r.icon} className="size-[1.125rem]" />
                  </span>
                  <span className="text-[0.9375rem] text-ink group-hover:text-accent-strong">{r.name}</span>
                </Link>
              </NavigationMenu.Link>
            </li>
          ))}
        </ul>
      </div>
      <NavigationMenu.Link asChild>
        <Link
          href="/#toestel-zoeken"
          className="group relative flex min-h-56 flex-col justify-end overflow-hidden rounded-[1.25rem] bg-night p-6 text-white"
        >
          <div
            className="absolute -top-16 -right-16 size-56 rounded-full bg-accent/40 blur-3xl"
            aria-hidden
          />
          <Search className="relative mb-auto size-6 text-accent-light" aria-hidden />
          <p className="relative text-xl font-semibold tracking-tight">{t("Zoek jouw toestel", "Find your device")}</p>
          <p className="relative mt-1 text-sm text-neutral-300">
            {t("Kies je model en de reparatie die je nodig hebt.", "Choose your model and the repair you need.")}
          </p>
          <span className="relative mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-white">
            {t("Start de zoeker", "Start the finder")}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </span>
        </Link>
      </NavigationMenu.Link>
    </div>
  );
}

function MobileNav({ nav, phone, whatsapp, email }: Props) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button variant="secondary" size="sm" className="h-10 gap-2 px-4 lg:hidden" aria-label={t("Menu openen", "Open menu")}>
          <Menu className="size-5" aria-hidden />
          <span aria-hidden>Menu</span>
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-night/30 backdrop-blur-sm data-[state=open]:animate-[fade-up_0.2s_ease-out]" />
        <Dialog.Content className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-surface shadow-2xl outline-none data-[state=open]:animate-[slide-in_0.35s_cubic-bezier(0.22,1,0.36,1)]">
          <VisuallyHidden.Root>
            <Dialog.Title>Menu</Dialog.Title>
            <Dialog.Description>{t("Navigatie van Phone Repairs", "Phone Repairs navigation")}</Dialog.Description>
          </VisuallyHidden.Root>
          <div className="flex h-16 items-center justify-between px-4">
            <Logo onClick={close} />
            <Dialog.Close asChild>
              <Button variant="secondary" size="icon" aria-label={t("Menu sluiten", "Close menu")}>
                <X className="size-5" />
              </Button>
            </Dialog.Close>
          </div>
          <nav className="flex-1 overflow-y-auto px-4 pb-6" aria-label={t("Mobiel menu", "Mobile menu")}>
            <Accordion type="single" collapsible>
              <AccordionItem value="reparaties">
                <AccordionTrigger className="py-4 text-lg">{t("Reparaties", "Repairs")}</AccordionTrigger>
                <AccordionContent className="pb-4">
                  <div className="space-y-5">
                    {nav.categories.map((cat) => (
                      <div key={cat.id}>
                        <p className="mb-2 text-xs font-medium tracking-wide text-muted uppercase">{cat.name}</p>
                        <div className="flex flex-wrap gap-2">
                          {cat.brands.map((b) => (
                            <Link
                              key={b.href}
                              href={b.href}
                              onClick={close}
                              className="rounded-full bg-mist px-3.5 py-2 text-sm text-ink ring-1 ring-line transition-colors hover:bg-accent hover:text-white hover:ring-accent"
                            >
                              {b.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                    <div>
                      <p className="mb-1 text-xs font-medium tracking-wide text-muted uppercase">{t("Soort reparatie", "Type of repair")}</p>
                      {nav.repairs.map((r) => (
                        <Link
                          key={r.href}
                          href={r.href}
                          onClick={close}
                          className="flex items-center gap-3 py-2 text-[0.9375rem] text-ink transition-colors hover:text-accent-strong"
                        >
                          <ContentIcon name={r.icon} className="size-4 text-muted" />
                          {r.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <ul>
              {mainNav.map((item) => (
                <li key={item.href} className="border-b border-line">
                  <Link href={item.href} onClick={close} className="block py-4 text-lg font-medium text-ink transition-colors hover:text-accent-strong">
                    {t(item.label, item.labelEn)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="space-y-2 border-t border-line p-4">
            <LanguageSwitch className="mb-2 w-full justify-center" onNavigate={close} />
            {whatsapp && (
              <Button asChild size="lg" className="w-full">
                <a href={whatsapp} target="_blank" rel="noopener noreferrer" onClick={close}>
                  <MessageCircle aria-hidden />
                  {t("WhatsApp ons", "WhatsApp us")}
                </a>
              </Button>
            )}
            <Button asChild variant={whatsapp ? "secondary" : "primary"} size="lg" className="w-full">
              <a href={phone.href}>
                <Phone aria-hidden />
                {t("Bel", "Call")} {phone.display}
              </a>
            </Button>
            <a href={`mailto:${email}`} className="flex items-center justify-center gap-2 pt-2 text-sm text-muted hover:text-ink">
              <Mail className="size-4" aria-hidden />
              {t("Of mail naar", "Or e-mail")} {email}
            </a>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
