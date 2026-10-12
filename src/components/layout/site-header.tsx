import { getNavData } from "@/components/layout/nav-data";
import { SiteHeaderClient } from "@/components/layout/site-header-client";
import { getLocale } from "@/lib/i18n-server";
import { site, whatsappHref, whatsappMessage } from "@/lib/site";

export async function SiteHeader() {
  const locale = await getLocale();
  return (
    <SiteHeaderClient
      nav={getNavData(locale)}
      phone={{ display: site.phone.display, href: site.phone.href }}
      whatsapp={whatsappHref(locale === "en" ? whatsappMessage({ locale }) : undefined)}
      email={site.email}
    />
  );
}
