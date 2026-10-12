import Image from "next/image";
import ctaPhoto from "@/assets/photos/cta-internals.jpg";
import { Reveal } from "@/components/motion/reveal";
import { ContactActions } from "@/components/contact/contact-actions";
import { getI18n } from "@/lib/i18n-server";

export async function FinalCta({
  title,
  body,
  message,
}: {
  title?: string;
  body?: string;
  /** Prefilled WhatsApp message. */
  message?: string;
}) {
  const { t } = await getI18n();
  title ??= t("Klaar om je toestel te laten repareren?", "Ready to have your device repaired?");
  body ??= t(
    "Stuur ons een WhatsApp of bel voor een afspraak. De meeste reparaties zijn binnen ongeveer 30 minuten klaar, terwijl je meekijkt.",
    "Send us a WhatsApp or call for an appointment. Most repairs are done in about 30 minutes while you watch.",
  );
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
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgb(34_34_34/0.7),rgb(34_34_34/0.88))]" aria-hidden />
          <div className="absolute -bottom-32 left-1/2 -z-10 h-64 w-[40rem] -translate-x-1/2 rounded-full bg-accent/35 blur-[100px]" aria-hidden />
          <h2 className="mx-auto max-w-2xl text-headline font-semibold text-balance text-white">{title}</h2>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-pretty text-neutral-300">{body}</p>
          <ContactActions tone="dark" message={message} className="mt-10 flex flex-col items-center [&>div]:justify-center" />
        </div>
      </Reveal>
    </section>
  );
}
