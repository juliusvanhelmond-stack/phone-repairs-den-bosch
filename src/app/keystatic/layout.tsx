import type { Metadata } from "next";
import { cmsEnabled } from "@/lib/cms";
import KeystaticApp from "./keystatic";

export const metadata: Metadata = {
  title: "Beheer · Phone Repairs",
  robots: { index: false, follow: false },
};

/** Root layout of the CMS admin (separate from the site's [lang] layout). */
export default function KeystaticLayout() {
  return (
    <html lang="nl">
      <body>
        {cmsEnabled ? (
          <KeystaticApp />
        ) : (
          <main style={{ fontFamily: "system-ui, sans-serif", maxWidth: 560, margin: "15vh auto", padding: 24, lineHeight: 1.5 }}>
            <h1 style={{ fontSize: 24 }}>Beheer nog niet gekoppeld</h1>
            <p>
              Het beheer van de website wordt actief zodra de koppeling met GitHub is ingesteld. Tot die tijd worden
              wijzigingen via JUNE Studio doorgevoerd.
            </p>
          </main>
        )}
      </body>
    </html>
  );
}
