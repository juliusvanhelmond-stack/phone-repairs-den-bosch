import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LandingTemplate } from "@/components/landing/landing-template";
import { DataRecoveryForm } from "@/components/partners/data-recovery-form";
import { TradeIn } from "@/components/partners/trade-in";
import { getLandingPage, localizeLanding, landingPages } from "@/lib/catalog";
import { getLocale } from "@/lib/i18n-server";
import { pageMetadata } from "@/lib/seo";

// Area and service pages that keep their original top-level URL (e.g. /telefoon-reparatie-rosmalen).
// Unknown slugs get a real 404 from src/proxy.ts.
export const instant = false;

const topLevel = landingPages.filter((p) => p.path.split("/").length === 2);

export function generateStaticParams() {
  return topLevel.map((p) => ({ page: p.path.slice(1) }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/[page]">): Promise<Metadata> {
  const page = getLandingPage(`/${(await params).page}`);
  if (!page) return {};
  const locale = await getLocale();
  const { seo } = localizeLanding(page, locale);
  return pageMetadata({ title: seo.title, description: seo.description, path: page.path, locale });
}

export default async function LandingRoute({ params }: PageProps<"/[lang]/[page]">) {
  const page = getLandingPage(`/${(await params).page}`);
  if (!page || page.path.split("/").length !== 2) notFound();
  // Partner blocks of the current site (client, e-mail 2026-10-14).
  const extra = page.id === "data-recovery" ? <DataRecoveryForm /> : page.id === "pre-owned-toestellen" ? <TradeIn /> : null;
  return <LandingTemplate page={page}>{extra}</LandingTemplate>;
}
