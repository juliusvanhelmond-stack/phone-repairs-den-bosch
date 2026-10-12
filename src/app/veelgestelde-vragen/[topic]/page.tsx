import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LandingTemplate } from "@/components/landing/landing-template";
import { faqTopicPages, getLandingPage } from "@/lib/catalog";
import { pageMetadata } from "@/lib/seo";

// FAQ sub-pages that keep their original URL (e.g. /veelgestelde-vragen/reparatie-opsturen).
export const instant = false;

export function generateStaticParams() {
  return faqTopicPages.map((p) => ({ topic: p.path.split("/").pop()! }));
}

const pathFor = (topic: string) => `/veelgestelde-vragen/${topic}`;

export async function generateMetadata({ params }: PageProps<"/veelgestelde-vragen/[topic]">): Promise<Metadata> {
  const page = getLandingPage(pathFor((await params).topic));
  if (!page) return {};
  return pageMetadata({ title: page.seo.title, description: page.seo.description, path: page.path });
}

export default async function FaqTopicPage({ params }: PageProps<"/veelgestelde-vragen/[topic]">) {
  const page = getLandingPage(pathFor((await params).topic));
  if (!page) notFound();
  return <LandingTemplate page={page} />;
}
