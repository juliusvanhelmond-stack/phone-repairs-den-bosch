/**
 * The CMS (/keystatic) works locally on the files (npm run dev). In production it only runs
 * once GitHub storage is set up (docs/cms.md); until then the admin shows a notice and the
 * API answers 404, so a deployed site never tries to write to its own (read-only) files.
 */
export const cmsEnabled = process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_KEYSTATIC_STORAGE === "github";
