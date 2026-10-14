import type { Metadata } from "next";
import { Link } from "@/components/i18n/link";
import { ArrowRight } from "lucide-react";
import { DemoNote } from "@/components/devices/demo-note";
import { FinalCta } from "@/components/home/final-cta";
import { PageIntro } from "@/components/layout/page-intro";
import { Reveal } from "@/components/motion/reveal";
import { blogPath, blogPosts, localizeBlog } from "@/lib/catalog";
import { getI18n } from "@/lib/i18n-server";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getI18n();
  return pageMetadata({
    title: "Blog",
    description: t(
      "Tips en uitleg van Phone Repairs over waterschade, batterijen, schermen en het beschermen van je smartphone.",
      "Tips and explanations from Phone Repairs about water damage, batteries, screens and protecting your smartphone.",
    ),
    path: "/blog-post",
    locale,
  });
}

export default async function BlogIndexPage() {
  const { locale, t } = await getI18n();
  return (
    <>
      <PageIntro
        crumbs={[{ name: "Blog", href: "/blog-post" }]}
        eyebrow="Blog"
        title={t("Tips en uitleg.", "Tips and explanations.")}
        intro={t(
          "Over waterschade, batterijen, schermen en hoe je je toestel heel houdt.",
          "About water damage, batteries, screens and how to keep your device in one piece.",
        )}
      >
        <DemoNote className="max-w-2xl">
          {t(
            "Het blogarchief houdt zijn huidige URL (/blog-post/). Hier staan de berichten die nu bekend zijn; het volledige archief komt mee bij de migratie.",
            "The Dutch blog archive keeps its current URL (/blog-post/). These are the posts known so far; the full archive follows with the migration. English texts are our translations.",
          )}
        </DemoNote>
      </PageIntro>
      <section className="py-16 lg:py-24">
        <ul className="container-page grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((p) => localizeBlog(p, locale)).map((post, i) => (
            <li key={post.id}>
              <Reveal delay={i * 0.04} className="h-full">
                <Link
                  href={blogPath(post.slug)}
                  className="group flex h-full flex-col rounded-[var(--radius-card)] bg-surface p-7 ring-1 ring-line transition-[box-shadow,transform] duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]"
                >
                  <h2 className="text-title font-semibold text-ink">{post.title}</h2>
                  {post.excerpt && <p className="mt-3 flex-1 leading-relaxed text-muted">{post.excerpt}</p>}
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-accent-strong">
                    {t("Lees meer", "Read more")}
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </span>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>
      <FinalCta />
    </>
  );
}
