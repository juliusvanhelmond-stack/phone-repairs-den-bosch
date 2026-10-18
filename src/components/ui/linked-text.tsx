import { Fragment, type ReactNode } from "react";
import { site, whatsappHref } from "@/lib/site";

const LINK = "font-medium text-accent-strong underline underline-offset-4 hover:text-accent";

/**
 * Turns contact words in plain text into links: WhatsApp, calling, e-mail, the phone number and the
 * e-mail address (client request 2026-10-16: "linkjes naar WhatsApp, bellen en mail").
 */
export function LinkedText({ text }: { text: string }) {
  const wa = whatsappHref();
  const rules: { re: RegExp; href: string | null; external?: boolean }[] = [
    { re: /\bWhatsApp\b/, href: wa, external: true },
    { re: /\b(telefonisch|by phone|bel ons|call us)\b|073[ -]?822[ -]?0013|073-8220013/i, href: site.phone.href },
    { re: /\b(per e-mail|by e-mail)\b|info@phonerepairs\.nl/i, href: `mailto:${site.email}` },
  ];
  const parts: ReactNode[] = [];
  let rest = text;
  let key = 0;
  while (rest) {
    let best: { index: number; length: number; href: string; external?: boolean } | null = null;
    for (const r of rules) {
      if (!r.href) continue;
      const m = r.re.exec(rest);
      if (m && (!best || m.index < best.index)) best = { index: m.index, length: m[0].length, href: r.href, external: r.external };
    }
    if (!best) {
      parts.push(rest);
      break;
    }
    parts.push(rest.slice(0, best.index));
    const label = rest.slice(best.index, best.index + best.length);
    parts.push(
      <a key={key++} href={best.href} className={LINK} {...(best.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
        {label}
      </a>,
    );
    rest = rest.slice(best.index + best.length);
  }
  return parts.map((p, i) => <Fragment key={i}>{p}</Fragment>);
}
