import { readFileSync } from "node:fs";
import path from "node:path";
import { z } from "zod";

const summarySchema = z.object({
  /** Average of the last 12 months, Kiyoh's headline score (as on the current site). */
  score: z.number().min(0).max(10),
  /** All-time number of reviews. */
  count: z.number().int().nonnegative(),
  /** Most recent reviews as published on Kiyoh (first name, place, rating, text). */
  reviews: z
    .array(
      z.object({
        author: z.string(),
        city: z.string(),
        rating: z.number().min(0).max(10),
        title: z.string(),
        text: z.string(),
        date: z.string(),
      }),
    )
    .default([]),
  fetchedAt: z.string(),
});

export type KiyohSummary = z.infer<typeof summarySchema>;

/**
 * Kiyoh score and review count, fetched from the client's feed before each build
 * (`scripts/reviews/fetch-kiyoh.ts`). Null when there is no data: the site then shows
 * a plain link to the reviews, never a typed-in score.
 */
export function getKiyohSummary(): KiyohSummary | null {
  try {
    const raw = readFileSync(path.join(process.cwd(), "src/data/generated/kiyoh.json"), "utf8");
    return summarySchema.parse(JSON.parse(raw));
  } catch {
    return null;
  }
}
