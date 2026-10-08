import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { ContentIcon } from "@/components/repairs/icon";
import { SectionHeading } from "@/components/ui/section-heading";
import { repairPath, repairs } from "@/lib/catalog";

export function PopularRepairs() {
  const items = repairs.filter((r) => r.popular).slice(0, 6);
  return (
    <section className="py-20 lg:py-28">
      <div className="container-page">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <Reveal>
            <SectionHeading
              eyebrow="Populaire reparaties"
              title="Waar kunnen we je mee helpen?"
              intro="De meest voorkomende reparaties voor smartphones, tablets en MacBooks."
            />
          </Reveal>
        </div>
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((r, i) => (
            <li key={r.id}>
              <Reveal delay={i * 0.05} className="h-full">
                <Link
                  href={repairPath(r.slug)}
                  className="group relative flex h-full flex-col rounded-[var(--radius-card)] bg-white p-7 ring-1 ring-line transition-[box-shadow,transform] duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)] hover:ring-line-strong"
                >
                  <span className="grid size-12 place-items-center rounded-2xl bg-mist text-ink ring-1 ring-line transition-colors duration-300 group-hover:bg-accent group-hover:text-white group-hover:ring-accent">
                    <ContentIcon name={r.icon} className="size-[1.375rem]" />
                  </span>
                  <h3 className="mt-10 text-xl font-semibold tracking-tight text-ink">{r.name}</h3>
                  <p className="mt-2 leading-relaxed text-pretty text-muted">{r.summary}</p>
                  <ArrowUpRight
                    className="absolute top-7 right-7 size-5 text-line-strong transition-[color,transform] duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-ink"
                    aria-hidden
                  />
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
