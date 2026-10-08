import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import Image from "next/image";
import ctaPhoto from "@/assets/photos/cta-internals.jpg";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/site";

export function FinalCta({
  title = "Klaar om je toestel te laten repareren?",
  body = "Maak een afspraak. De meeste reparaties zijn binnen ongeveer 30 minuten klaar, terwijl je meekijkt.",
}: {
  title?: string;
  body?: string;
}) {
  return (
    <section className="px-4 pb-20 sm:px-6 lg:px-8 lg:pb-28">
      <Reveal>
        <div className="relative isolate mx-auto max-w-[76rem] overflow-hidden rounded-[var(--radius-panel)] bg-night px-6 py-16 text-center sm:px-12 lg:py-24">
          <Image
            src={ctaPhoto}
            alt=""
            fill
            placeholder="blur"
            sizes="(min-width: 1280px) 76rem, 100vw"
            className="-z-20 object-cover"
          />
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgb(16_24_40/0.7),rgb(16_24_40/0.88))]" aria-hidden />
          <div className="absolute -bottom-32 left-1/2 -z-10 h-64 w-[40rem] -translate-x-1/2 rounded-full bg-accent/35 blur-[100px]" aria-hidden />
          <h2 className="mx-auto max-w-2xl text-headline font-semibold text-balance text-white">{title}</h2>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-pretty text-slate-300">{body}</p>
          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" variant="light">
              <Link href="/afspraak">
                Maak een afspraak
                <ArrowRight aria-hidden />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline-light">
              <a href={site.phone.href}>
                <Phone aria-hidden />
                Bel {site.phone.display}
              </a>
            </Button>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
