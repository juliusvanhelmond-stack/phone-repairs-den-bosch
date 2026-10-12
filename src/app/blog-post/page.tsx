import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DemoNote } from "@/components/devices/demo-note";
import { FinalCta } from "@/components/home/final-cta";
import { PageIntro } from "@/components/layout/page-intro";
import { Reveal } from "@/components/motion/reveal";
import { blogPath, blogPosts } from "@/lib/catalog";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Blog",
  description: "Tips en uitleg van Phone Repairs over waterschade, batterijen, schermen en het beschermen van je smartphone.",
  path: "/blog-post",
});

export default function BlogIndexPage() {
  return (
    <>
      <PageIntro
        crumbs={[{ name: "Blog", href: "/blog-post" }]}
        eyebrow="Blog"
        title="Tips en uitleg."
        intro="Over waterschade, batterijen, schermen en hoe je je toestel heel houdt."
      >
        <DemoNote className="max-w-2xl">
          Het blogarchief houdt zijn huidige URL (/blog-post/). Hier staan de berichten die nu bekend zijn; het
          volledige archief komt mee bij de migratie.
        </DemoNote>
      </PageIntro>
      <section className="py-16 lg:py-24">
        <ul className="container-page grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post, i) => (
            <li key={post.id}>
              <Reveal delay={i * 0.04} className="h-full">
                <Link
                  href={blogPath(post.slug)}
                  className="group flex h-full flex-col rounded-[var(--radius-card)] bg-white p-7 ring-1 ring-line transition-[box-shadow,transform] duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]"
                >
                  <h2 className="text-title font-semibold text-ink">{post.title}</h2>
                  {post.excerpt && <p className="mt-3 flex-1 leading-relaxed text-muted">{post.excerpt}</p>}
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-accent-strong">
                    Lees meer
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
