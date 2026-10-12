import { Link } from "@/components/i18n/link";
import { ArrowRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getI18n } from "@/lib/i18n-server";

export async function NotFoundContent() {
  const { t } = await getI18n();
  return (
    <section className="container-page flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p className="font-mono text-sm text-muted">404</p>
      <h1 className="mt-4 text-headline font-semibold text-balance text-ink">
        {t("Deze pagina bestaat niet (meer).", "This page does not exist (anymore).")}
      </h1>
      <p className="mt-5 max-w-lg text-lg text-muted">
        {t(
          "Misschien is de pagina verplaatst. Zoek je toestel of ga terug naar de homepage.",
          "The page may have moved. Find your device or go back to the homepage.",
        )}
      </p>
      <div className="mt-9 flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg">
          <Link href="/#toestel-zoeken">
            <Search aria-hidden />
            {t("Zoek jouw toestel", "Find your device")}
          </Link>
        </Button>
        <Button asChild size="lg" variant="secondary">
          <Link href="/">
            {t("Naar de homepage", "Go to the homepage")}
            <ArrowRight aria-hidden />
          </Link>
        </Button>
      </div>
    </section>
  );
}

export default function NotFound() {
  return <NotFoundContent />;
}
