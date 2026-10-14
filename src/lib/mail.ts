/**
 * Outgoing mail for the website forms, via the Resend HTTP API (no SDK needed).
 * Server-side secrets, never NEXT_PUBLIC_:
 * - RESEND_API_KEY   API key of the shop's Resend account
 * - FORM_MAIL_TO     where form submissions go (the shop's inbox)
 * - FORM_MAIL_FROM   verified sender, e.g. "Phone Repairs website <formulier@phonerepairs.nl>"
 * Without them nothing is sent and the forms say so.
 */
export function mailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.FORM_MAIL_TO && process.env.FORM_MAIL_FROM);
}

export async function sendMail({ subject, text, replyTo }: { subject: string; text: string; replyTo?: string }): Promise<boolean> {
  if (!mailConfigured()) return false;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.FORM_MAIL_FROM,
      to: process.env.FORM_MAIL_TO!.split(",").map((s) => s.trim()),
      subject,
      text,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
    signal: AbortSignal.timeout(10_000),
  }).catch(() => null);
  return Boolean(response?.ok);
}
