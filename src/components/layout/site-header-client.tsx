"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Dialog, NavigationMenu, VisuallyHidden } from "radix-ui";
import { ArrowRight, ChevronDown, Menu, Phone, Search, X } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import type { NavData } from "@/components/layout/nav-data";
import { mainNav } from "@/components/layout/nav-data";
import { ContentIcon } from "@/components/repairs/icon";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = { nav: NavData; phone: { display: string; href: string } };

export function SiteHeaderClient({ nav, phone }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

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
          ? "bg-white/85 shadow-[0_1px_0_rgb(17_24_39/0.06),0_8px_24px_-16px_rgb(30_58_138/0.18)] backdrop-blur-xl backdrop-saturate-150"
          : "bg-white/0",
      )}
    >
      <div className="container-page relative flex h-16 items-center justify-between gap-6 lg:h-[4.5rem]">
        <Logo />

        <NavigationMenu.Root className="static hidden lg:block" aria-label="Hoofdmenu">
          <NavigationMenu.List className="flex items-center gap-0.5 xl:gap-1">
            <NavigationMenu.Item>
              <NavigationMenu.Trigger
                className={cn(
                  "group flex h-10 items-center gap-1 rounded-full px-3 text-[0.9375rem] whitespace-nowrap xl:px-4 text-ink-soft transition-colors hover:bg-mist hover:text-ink data-[state=open]:bg-mist data-[state=open]:text-ink",
                  pathname.startsWith("/reparatie") && "text-ink",
                )}
              >
                Reparaties
                <ChevronDown
                  className="size-3.5 transition-transform duration-200 group-data-[state=open]:rotate-180"
                  aria-hidden
                />
              </NavigationMenu.Trigger>
              <NavigationMenu.Content forceMount className="fixed inset-x-0 top-[4.5rem] data-[state=closed]:hidden px-4 pt-2 sm:px-6 lg:px-8 data-[motion=from-start]:animate-fade-up data-[motion=from-end]:animate-fade-up">
                <MegaMenu nav={nav} />
              </NavigationMenu.Content>
            </NavigationMenu.Item>
            {mainNav.map((item) => (
              <NavigationMenu.Item key={item.href}>
                <NavigationMenu.Link asChild active={pathname === item.href}>
                  <Link
                    href={item.href}
                    className="flex h-10 items-center rounded-full px-3 text-[0.9375rem] whitespace-nowrap text-ink-soft xl:px-4 transition-colors hover:bg-mist hover:text-ink data-[active]:text-ink"
                  >
                    {item.label}
                  </Link>
                </NavigationMenu.Link>
              </NavigationMenu.Item>
            ))}
          </NavigationMenu.List>
        </NavigationMenu.Root>

        <div className="flex items-center gap-2">
          <a
            href={phone.href}
            className="hidden h-10 items-center gap-2 rounded-full px-3 text-[0.9375rem] text-ink-soft transition-colors hover:text-ink xl:flex"
          >
            <Phone className="size-4" aria-hidden />
            {phone.display}
          </a>
          <Button asChild size="sm" className="hidden h-10 px-5 sm:inline-flex">
            <Link href="/afspraak">Maak een afspraak</Link>
          </Button>
          <MobileNav nav={nav} phone={phone} />
        </div>
      </div>
    </header>
  );
}

function MegaMenu({ nav }: { nav: NavData }) {
  return (
    <div className="mx-auto grid max-w-[76rem] gap-2 overflow-hidden rounded-[1.75rem] bg-white p-2 shadow-[var(--shadow-lift)] ring-1 ring-line lg:grid-cols-[1.2fr_1fr_0.8fr]">
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
                      className="block rounded-full bg-mist px-3.5 py-1.5 text-[0.9375rem] whitespace-nowrap text-ink ring-1 ring-line transition-colors hover:bg-ink hover:text-white hover:ring-ink"
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
        <p className="mb-2 px-2 pt-2 text-xs font-medium tracking-wide text-muted uppercase">Reparaties</p>
        <ul>
          {nav.repairs.map((r) => (
            <li key={r.href}>
              <NavigationMenu.Link asChild>
                <Link
                  href={r.href}
                  className="group flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-mist"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-mist text-ink ring-1 ring-line transition-colors group-hover:bg-white">
                    <ContentIcon name={r.icon} className="size-[1.125rem]" />
                  </span>
                  <span className="text-[0.9375rem] text-ink">{r.name}</span>
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
          <div className="bg-grid absolute inset-0 opacity-[0.35] invert" aria-hidden />
          <div
            className="absolute -top-16 -right-16 size-56 rounded-full bg-accent/40 blur-3xl"
            aria-hidden
          />
          <Search className="relative mb-auto size-6 text-blue-300" aria-hidden />
          <p className="relative text-xl font-semibold tracking-tight">Zoek jouw toestel</p>
          <p className="relative mt-1 text-sm text-slate-300">Kies je model en de reparatie die je nodig hebt.</p>
          <span className="relative mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-white">
            Start de zoeker
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </span>
        </Link>
      </NavigationMenu.Link>
    </div>
  );
}

function MobileNav({ nav, phone }: Props) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button variant="secondary" size="icon" className="lg:hidden" aria-label="Menu openen">
          <Menu className="size-5" />
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-night/30 backdrop-blur-sm data-[state=open]:animate-[fade-up_0.2s_ease-out]" />
        <Dialog.Content className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-white shadow-2xl outline-none data-[state=open]:animate-[slide-in_0.35s_cubic-bezier(0.22,1,0.36,1)]">
          <VisuallyHidden.Root>
            <Dialog.Title>Menu</Dialog.Title>
            <Dialog.Description>Navigatie van Phone Repairs</Dialog.Description>
          </VisuallyHidden.Root>
          <div className="flex h-16 items-center justify-between px-4">
            <Logo onClick={close} />
            <Dialog.Close asChild>
              <Button variant="secondary" size="icon" aria-label="Menu sluiten">
                <X className="size-5" />
              </Button>
            </Dialog.Close>
          </div>
          <nav className="flex-1 overflow-y-auto px-4 pb-6" aria-label="Mobiel menu">
            <Accordion type="single" collapsible>
              <AccordionItem value="reparaties">
                <AccordionTrigger className="py-4 text-lg">Reparaties</AccordionTrigger>
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
                              className="rounded-full bg-mist px-3.5 py-2 text-sm text-ink ring-1 ring-line"
                            >
                              {b.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                    <div>
                      <p className="mb-1 text-xs font-medium tracking-wide text-muted uppercase">Soort reparatie</p>
                      {nav.repairs.map((r) => (
                        <Link
                          key={r.href}
                          href={r.href}
                          onClick={close}
                          className="flex items-center gap-3 py-2 text-[0.9375rem] text-ink"
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
                  <Link href={item.href} onClick={close} className="block py-4 text-lg font-medium text-ink">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="space-y-2 border-t border-line p-4">
            <Button asChild size="lg" className="w-full">
              <Link href="/afspraak" onClick={close}>
                Maak een afspraak
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg" className="w-full">
              <a href={phone.href}>
                <Phone aria-hidden />
                Bel {phone.display}
              </a>
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
