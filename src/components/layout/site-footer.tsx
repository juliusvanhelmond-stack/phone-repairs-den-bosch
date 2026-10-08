import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { brandPath, brands, repairPath, repairs } from "@/lib/catalog";
import { mapsUrl, site } from "@/lib/site";

const companyLinks = [
  { label: "Werkwijze", href: "/werkwijze" },
  { label: "Over ons", href: "/over-ons" },
  { label: "Veelgestelde vragen", href: "/veelgestelde-vragen" },
  { label: "Contact", href: "/contact" },
  { label: "Afspraak maken", href: "/afspraak" },
];

export function SiteFooter() {
  return (
    <footer className="bg-night text-slate-300">
      <div className="container-page grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:py-20">
        <div className="max-w-sm">
          <Logo tone="light" />
          <p className="mt-5 text-[0.9375rem] leading-relaxed text-slate-400">
            Reparatie van smartphones, tablets en MacBooks in {site.address.cityShort}. Op afspraak, vaak binnen
            30 minuten klaar.
          </p>
          <ul className="mt-6 space-y-3 text-[0.9375rem]">
            <li>
              <a href={site.phone.href} className="inline-flex items-center gap-3 transition-colors hover:text-white">
                <Phone className="size-4 text-slate-500" aria-hidden />
                {site.phone.display}
              </a>
            </li>
            <li>
              <a href={`mailto:${site.email}`} className="inline-flex items-center gap-3 transition-colors hover:text-white">
                <Mail className="size-4 text-slate-500" aria-hidden />
                {site.email}
              </a>
            </li>
            <li>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 transition-colors hover:text-white"
              >
                <MapPin className="size-4 text-slate-500" aria-hidden />
                {site.address.street}, {site.address.cityShort}
              </a>
            </li>
          </ul>
        </div>
        <FooterColumn
          title="Reparaties"
          links={repairs.map((r) => ({ label: r.name, href: repairPath(r.slug) }))}
        />
        <FooterColumn title="Merken" links={brands.map((b) => ({ label: b.name, href: brandPath(b.id) }))} />
        <FooterColumn title="Phone Repairs" links={companyLinks} />
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-6 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {site.legalName}</p>
          <p>Ontwerpvoorstel door JUNE Studio · niet geïndexeerd</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <p className="mb-4 text-sm font-medium text-white">{title}</p>
      <ul className="space-y-2.5 text-[0.9375rem]">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="transition-colors hover:text-white">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
