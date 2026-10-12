import { Link } from "@/components/i18n/link";
import { ChevronRight } from "lucide-react";
import { JsonLd } from "@/components/ui/json-ld";
import { breadcrumbJsonLd } from "@/lib/seo";
import { getI18n } from "@/lib/i18n-server";
import { cn } from "@/lib/utils";

export type Crumb = { name: string; href: string };

/** Crumb hrefs are Dutch paths; links and structured data use the active language. */
export async function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  const { t, href } = await getI18n();
  const all = [{ name: "Home", href: "/" }, ...items];
  return (
    <>
      <nav aria-label={t("Kruimelpad", "Breadcrumb")} className={cn("text-sm text-muted", className)}>
        <ol className="flex flex-wrap items-center gap-1.5">
          {all.map((item, i) => {
            const last = i === all.length - 1;
            return (
              <li key={item.href} className="flex items-center gap-1.5">
                {last ? (
                  <span aria-current="page" className="text-ink">
                    {item.name}
                  </span>
                ) : (
                  <>
                    <Link href={item.href} className="transition-colors hover:text-ink">
                      {item.name}
                    </Link>
                    <ChevronRight className="size-3.5 text-line-strong" aria-hidden />
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <JsonLd data={breadcrumbJsonLd(all.map((c) => ({ ...c, href: href(c.href) })))} />
    </>
  );
}
