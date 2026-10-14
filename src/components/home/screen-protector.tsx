import { ArrowRight, ShieldCheck } from "lucide-react";
import { Link } from "@/components/i18n/link";
import { Reveal } from "@/components/motion/reveal";
import { blogPath, getBlogPost } from "@/lib/catalog";
import { getI18n } from "@/lib/i18n-server";

const SLUG = "flexible-hydrogel-screen-protectors";

/**
 * The hydrogel screen protector block of the current homepage (text verbatim from the
 * WordPress export, 2026-10-12), linking to its blog post.
 */
export async function ScreenProtector() {
  const { t } = await getI18n();
  if (!getBlogPost(SLUG)) return null;
  return (
    <section className="py-16 lg:py-20">
      <div className="container-page">
        <Reveal>
          <div className="tone-dark grid gap-8 rounded-[var(--radius-panel)] p-7 sm:p-10 lg:grid-cols-[auto_1fr] lg:gap-12">
            <span className="grid size-14 place-items-center rounded-2xl bg-accent text-white">
              <ShieldCheck className="size-7" aria-hidden />
            </span>
            <div className="max-w-3xl">
              <h2 className="text-title font-semibold text-balance text-ink">
                {t(
                  "Waarom kiezen voor een Premium Flexible Hydrogel Screen Protector?",
                  "Why choose a Premium Flexible Hydrogel Screen Protector?",
                )}
              </h2>
              <p className="mt-4 leading-relaxed text-muted">
                {t(
                  "Wil je jouw smartphone, tablet, Nintendo Switch, camera of ander scherm optimaal beschermen tegen krassen en beschadigingen? Kies dan voor een Premium Flexible Hydrogel Screen Protector van Phone Repairs.",
                  "Want the best protection against scratches and damage for your smartphone, tablet, Nintendo Switch, camera or other screen? Choose a Premium Flexible Hydrogel Screen Protector from Phone Repairs.",
                )}
              </p>
              <p className="mt-4 leading-relaxed text-muted">
                {t(
                  "Een traditionele glazen screenprotector kan barsten of breken bij een impact. Een flexibele hydrogel screenprotector werkt anders. Het materiaal is flexibel, sterk en ontworpen om dagelijkse beschadigingen en lichte impact op te vangen. Hierdoor blijft je scherm langer mooi en goed beschermd, zonder het kwetsbare gevoel van standaard beschermglas.",
                  "A traditional glass screen protector can crack or break on impact. A flexible hydrogel screen protector works differently. The material is flexible, strong and designed to absorb everyday damage and light impact. Your screen stays nice and well protected for longer, without the fragile feel of standard protective glass.",
                )}
              </p>
              <Link
                href={blogPath(SLUG)}
                className="mt-6 inline-flex items-center gap-1.5 text-[0.9375rem] font-medium text-accent-strong hover:text-accent"
              >
                {t("Alles over de hydrogel screenprotector", "All about the hydrogel screen protector")}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
