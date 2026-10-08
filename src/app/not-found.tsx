import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="container-page flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p className="font-mono text-sm text-muted">404</p>
      <h1 className="mt-4 text-headline font-semibold text-balance text-ink">Deze pagina bestaat niet (meer).</h1>
      <p className="mt-5 max-w-lg text-lg text-muted">
        Misschien is de pagina verplaatst. Zoek je toestel of ga terug naar de homepage.
      </p>
      <div className="mt-9 flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg">
          <Link href="/#toestel-zoeken">
            <Search aria-hidden />
            Zoek jouw toestel
          </Link>
        </Button>
        <Button asChild size="lg" variant="secondary">
          <Link href="/">
            Naar de homepage
            <ArrowRight aria-hidden />
          </Link>
        </Button>
      </div>
    </section>
  );
}
