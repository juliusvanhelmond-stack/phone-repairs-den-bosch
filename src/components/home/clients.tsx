import clientsJson from "@/data/clients.json";
import { getI18n } from "@/lib/i18n-server";

/**
 * "Wij repareren o.a. voor:" logo carousel of the current homepage (logos and order as there).
 * A CSS marquee; with reduced motion the logos wrap instead.
 */
export async function Clients() {
  const { t } = await getI18n();
  const clients = clientsJson.clients;
  if (!clients.length) return null;
  const list = (hidden: boolean) => (
    <ul
      className={`flex shrink-0 items-center gap-4 pr-4 motion-reduce:shrink motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:gap-3 motion-reduce:px-4 ${hidden ? "motion-reduce:hidden" : ""}`}
      aria-hidden={hidden || undefined}
    >
      {clients.map((c) => (
        <li key={c.src} className="tone-light grid h-24 w-48 shrink-0 place-items-center rounded-2xl bg-white px-4 py-3 ring-1 ring-line">
          {/* eslint-disable-next-line @next/next/no-img-element -- small static logos on their original paths */}
          <img
            src={c.src}
            alt={hidden ? "" : c.name}
            width={c.width}
            height={c.height}
            loading="lazy"
            decoding="async"
            className="h-auto max-h-16 w-auto max-w-full object-contain"
          />
        </li>
      ))}
    </ul>
  );
  return (
    <section className="py-14 lg:py-16" aria-labelledby="klanten-titel">
      <div className="container-page">
        <h2 id="klanten-titel" className="text-center text-sm font-semibold tracking-wide text-muted uppercase">
          {t("Wij repareren o.a. voor:", "Among others, we repair for:")}
        </h2>
      </div>
      {/* With reduced motion the logos wrap in a static grid instead of sliding. */}
      <div className="marquee mt-8 overflow-hidden motion-safe:[mask-image:linear-gradient(to_right,transparent,#000_6%,#000_94%,transparent)]">
        <div className="marquee-track flex w-max motion-reduce:w-full">
          {list(false)}
          {list(true)}
        </div>
      </div>
    </section>
  );
}
