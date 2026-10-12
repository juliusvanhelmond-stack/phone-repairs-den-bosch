import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { DemoNote } from "@/components/devices/demo-note";
import { FinalCta } from "@/components/home/final-cta";
import { PageIntro } from "@/components/layout/page-intro";
import { blogPath, blogPosts, getBlogPost } from "@/lib/catalog";
import { pageMetadata } from "@/lib/seo";

// Blog posts keep their original URL (/blog-post/<slug>). Unknown slugs get a real 404 from src/proxy.ts.
export const instant = false;

export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog-post/[slug]">): Promise<Metadata> {
  const post = getBlogPost((await params).slug);
  if (!post) return {};
  return pageMetadata({
    title: post.seo?.title ?? post.title,
    description: post.seo?.description ?? post.excerpt ?? post.title,
    path: blogPath(post.slug),
  });
}

export default async function BlogPostPage({ params }: PageProps<"/blog-post/[slug]">) {
  const post = getBlogPost((await params).slug);
  if (!post) notFound();

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
          {/* Until the posts are migrated only the summary exists; render migrated bodyHtml after sanitising. */}
          <div className="space-y-5 text-lg leading-relaxed text-muted">
            {post.summary.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <DemoNote className="mt-10">
            Dit is een samenvatting van het huidige bericht. De volledige tekst wordt bij de migratie overgenomen,
            op dezelfde URL.
          </DemoNote>
          <Link href="/blog-post" className="mt-12 inline-flex items-center gap-2 font-medium text-accent-strong hover:text-accent">
            <ArrowLeft className="size-4" aria-hidden />
            Alle berichten
          </Link>
        </div>
      </article>
      <FinalCta />
    </>
  );
}
