import { readFileSync } from "node:fs";
import path from "node:path";
import { z } from "zod";

const summarySchema = z.object({
  /** Google star rating (1–5) as shown by the client's Trustindex badge. */
  score: z.number().min(1).max(5),
  count: z.number().int().positive(),
  fetchedAt: z.string(),
});

export type GoogleSummary = z.infer<typeof summarySchema>;

/**
 * Google score and review count, read from the client's Trustindex badge before each build
 * (`scripts/reviews/fetch-google.ts`). Null when there is no data: the site then shows a plain
 * link to the reviews, never a typed-in score.
 */
export function getGoogleSummary(): GoogleSummary | null {
  try {
    const raw = readFileSync(path.join(process.cwd(), "src/data/generated/google-reviews.json"), "utf8");
    return summarySchema.parse(JSON.parse(raw));
  } catch {
    return null;
  }
}
