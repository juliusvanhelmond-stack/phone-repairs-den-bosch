import { getNavData } from "@/components/layout/nav-data";
import { SiteHeaderClient } from "@/components/layout/site-header-client";
import { site } from "@/lib/site";

export function SiteHeader() {
  return <SiteHeaderClient nav={getNavData()} phone={{ display: site.phone.display, href: site.phone.href }} />;
}
