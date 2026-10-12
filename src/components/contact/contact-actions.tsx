import { Mail, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { site, whatsappHref, whatsappMessage } from "@/lib/site";
import { getI18n } from "@/lib/i18n-server";
import { cn } from "@/lib/utils";

/**
 * The site's main call to action, in the client's order of preference:
 * WhatsApp first, then phone, then e-mail as a quiet text link.
 */
export async function ContactActions({
  message,
  tone = "light",
  size = "lg",
  email = true,
  whatsappLabel,
  className,
}: {
  /** Prefilled WhatsApp message. */
  message?: string;
  tone?: "light" | "dark";
  size?: "md" | "lg";
  email?: boolean;
  whatsappLabel?: string;
  className?: string;
}) {
  const { locale, t } = await getI18n();
  const wa = whatsappHref(message ?? whatsappMessage({ locale }));
  const dark = tone === "dark";
  return (
    <div className={className}>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {wa && (
          <Button asChild size={size} variant={dark ? "light" : "primary"}>
            <a href={wa} target="_blank" rel="noopener noreferrer">
              <MessageCircle aria-hidden />
              {whatsappLabel ?? t("WhatsApp ons", "WhatsApp us")}
            </a>
          </Button>
        )}
        <Button asChild size={size} variant={dark ? "outline-light" : wa ? "secondary" : "primary"}>
          <a href={site.phone.href}>
            <Phone aria-hidden />
            {t("Bel", "Call")} {site.phone.display}
          </a>
        </Button>
      </div>
      {email && (
        <p className={cn("mt-4 text-sm", dark ? "text-neutral-400" : "text-muted")}>
          {t("Liever mailen?", "Prefer e-mail?")}{" "}
          <a
            href={`mailto:${site.email}`}
            className={cn(
              "inline-flex items-center gap-1 font-medium underline-offset-4 hover:underline",
              dark ? "text-white" : "text-accent-strong",
            )}
          >
            <Mail className="size-3.5" aria-hidden />
            {site.email}
          </a>
        </p>
      )}
    </div>
  );
}
