import { Megaphone } from "lucide-react";
import { Link } from "@/components/i18n/link";
import announcement from "@/data/generated/announcement.json";

type Announcement = { text: string; linkLabel?: string; linkHref?: string } | null;

/**
 * Announcement above the top bar (holidays, changed hours…), switched on and written by the shop
 * in the CMS ("Mededeling bovenaan"; client request, 2026-10-16). Nothing is rendered when it is off.
 */
export function AnnouncementBar() {
  const a = announcement as Announcement;
  if (!a) return null;
  const external = a.linkHref && /^https?:\/\//.test(a.linkHref);
  return (
    <div role="status" className="bg-accent text-white">
      <p className="container-page flex flex-wrap items-center justify-center gap-x-2 gap-y-1 py-2 text-center text-sm font-medium">
        <Megaphone className="size-4 shrink-0" aria-hidden />
        <span>{a.text}</span>
        {a.linkHref &&
          a.linkLabel &&
          (external ? (
            <a href={a.linkHref} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:no-underline">
              {a.linkLabel}
            </a>
          ) : (
            <Link href={a.linkHref} className="underline underline-offset-4 hover:no-underline">
              {a.linkLabel}
            </Link>
          ))}
      </p>
    </div>
  );
}
