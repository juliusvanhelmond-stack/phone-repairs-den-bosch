import type { Metadata } from "next";
import { Link } from "@/components/i18n/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { DemoNote } from "@/components/devices/demo-note";
import { FinalCta } from "@/components/home/final-cta";
import { PageIntro } from "@/components/layout/page-intro";
import { blogPath, blogPosts, getBlogPost, localizeBlog } from "@/lib/catalog";
import { getI18n } from "@/lib/i18n-server";
import { pageMetadata } from "@/lib/seo";
import { embedVideos } from "@/lib/video-embed";
import { HydrogelPrices, HYDROGEL_SLUG } from "@/components/partners/hydrogel-prices";

// Blog posts keep their original URL (/blog-post/<slug>). Unknown slugs get a real 404 from src/proxy.ts.
export const instant = false;

export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/blog-post/[slug]">): Promise<Metadata> {
  const { locale } = await getI18n();
  const found = getBlogPost((await params).slug);
  if (!found) return {};
  const post = localizeBlog(found, locale);
  return pageMetadata({
    title: (locale === "nl" && post.seo?.title) || post.title,
    description: (locale === "nl" && post.seo?.description) || post.excerpt || post.title,
    path: blogPath(post.slug),
    locale,
  });
}

export default async function BlogPostPage({ params }: PageProps<"/[lang]/blog-post/[slug]">) {
  const { locale, t } = await getI18n();
  const found = getBlogPost((await params).slug);
  if (!found) notFound();
  const post = localizeBlog(found, locale);

  return (
    <>
      <PageIntro
        crumbs={[
          { name: "Blog", href: "/blog-post" },
          { name: post.title, href: blogPath(post.slug) },
        ]}
        eyebrow="Blog"
        title={post.title}
        intro={post.excerpt}
      />
      <article className="py-16 lg:py-24">
        <div className="container-page max-w-3xl">
          {/* bodyHtml was sanitised at import (scripts/migration/wordpress/content.ts): text, headings, lists and links only. */}
          {post.bodyHtml && locale === "nl" ? (
            <div className="article" dangerouslySetInnerHTML={{ __html: embedVideos(post.bodyHtml) }} />
          ) : (
            <>
              <div className="space-y-5 text-lg leading-relaxed text-muted">
                {post.summary.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
              {post.bodyHtml ? (
                <section className="mt-12 border-t border-line pt-10">
                  <h2 className="text-title font-semibold text-ink">Full article (in Dutch)</h2>
                  <p className="mt-2 text-sm text-muted">The summary above is our translation; the full post is available in Dutch only.</p>
                  <div lang="nl" className="article mt-6" dangerouslySetInnerHTML={{ __html: embedVideos(post.bodyHtml) }} />
                </section>
              ) : (
                <DemoNote className="mt-10">
                  {t(
                    "Dit is een samenvatting van het huidige bericht. De volledige tekst wordt bij de migratie overgenomen, op dezelfde URL.",
                    "This is a summary of the current (Dutch) post, translated by us. The full text follows with the migration.",
                  )}
                </DemoNote>
              )}
            </>
          )}
          {post.slug === HYDROGEL_SLUG && <HydrogelPrices className="mt-12" />}
          <Link href="/blog-post" className="mt-12 inline-flex items-center gap-2 font-medium text-accent-strong hover:text-accent">
            <ArrowLeft className="size-4" aria-hidden />
            {t("Alle berichten", "All posts")}
          </Link>
        </div>
      </article>
      <FinalCta />
    </>
  );
}
