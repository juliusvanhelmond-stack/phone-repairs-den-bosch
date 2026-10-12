import type { Metadata } from "next";
import { NotFoundContent } from "@/app/[lang]/not-found";

// Body of the proxy's 404 response for unknown URLs (the proxy sets the status).
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function NotFoundPage() {
  return <NotFoundContent />;
}
