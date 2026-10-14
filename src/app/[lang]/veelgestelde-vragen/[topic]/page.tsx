import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SendInSection } from "@/components/forms/send-in-section";
import { LandingTemplate } from "@/components/landing/landing-template";
import { faqTopicPages, getLandingPage, localizeLanding } from "@/lib/catalog";
import { getLocale } from "@/lib/i18n-server";
import { pageMetadata } from "@/lib/seo";

// FAQ sub-pages that keep their original URL (e.g. /veelgestelde-vragen/reparatie-opsturen).
export const instant = false;

export function generateStaticParams() {
  return faqTopicPages.map((p) => ({ topic: p.path.split("/").pop()! }));
}

const pathFor = (topic: string) => `/veelgestelde-vragen/${topic}`;

export async function generateMetadata({ params }: PageProps<"/[lang]/veelgestelde-vragen/[topic]">): Promise<Metadata> {
  const page = getLandingPage(pathFor((await params).topic));
  if (!page) return {};
  const locale = await getLocale();
  const { seo } = localizeLanding(page, locale);
  return pageMetadata({ title: seo.title, description: seo.description, path: page.path, locale });
}

export default async function FaqTopicPage({ params }: PageProps<"/[lang]/veelgestelde-vragen/[topic]">) {
  const page = getLandingPage(pathFor((await params).topic));
  if (!page) notFound();
  return (
    <LandingTemplate page={page}>{page.id === "reparatie-opsturen" && <SendInSection />}</LandingTemplate>
  );
}
