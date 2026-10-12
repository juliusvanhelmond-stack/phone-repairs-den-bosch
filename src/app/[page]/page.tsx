import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LandingTemplate } from "@/components/landing/landing-template";
import { getLandingPage, landingPages } from "@/lib/catalog";
import { pageMetadata } from "@/lib/seo";

// Area and service pages that keep their original top-level URL (e.g. /telefoon-reparatie-rosmalen).
// Unknown slugs get a real 404 from src/proxy.ts.
export const instant = false;

const topLevel = landingPages.filter((p) => p.path.split("/").length === 2);

export function generateStaticParams() {
  return topLevel.map((p) => ({ page: p.path.slice(1) }));
}

export async function generateMetadata({ params }: PageProps<"/[page]">): Promise<Metadata> {
  const page = getLandingPage(`/${(await params).page}`);
  if (!page) return {};
  return pageMetadata({ title: page.seo.title, description: page.seo.description, path: page.path });
}

export default async function LandingRoute({ params }: PageProps<"/[page]">) {
  const page = getLandingPage(`/${(await params).page}`);
  if (!page || page.path.split("/").length !== 2) notFound();
  return <LandingTemplate page={page} />;
}
