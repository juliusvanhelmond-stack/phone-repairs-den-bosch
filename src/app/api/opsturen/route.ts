import { mailConfigured, sendMail } from "@/lib/mail";
import { makeSendInSchema, sendInSubject, sendInText } from "@/lib/send-in";

const schema = makeSendInSchema((nl) => nl);

/**
 * Receives the online send-in form and e-mails it to the shop.
 * Answers with `status`: "sent" only when the mail service accepted the message;
 * "not-configured" when no mail service is set up (the form then says nothing was sent).
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return Response.json({ status: "invalid" }, { status: 400 });
  // Bots fill in the hidden field; answer as if nothing happened, but send nothing.
  if (parsed.data.website) return Response.json({ status: "invalid" }, { status: 400 });
  // An expected state (no mail service yet), not an error: the form then offers its fallbacks.
  if (!mailConfigured()) return Response.json({ status: "not-configured" });

  const date = new Intl.DateTimeFormat("nl-NL", { dateStyle: "long", timeStyle: "short", timeZone: "Europe/Amsterdam" }).format(new Date());
  const sent = await sendMail({ subject: sendInSubject(parsed.data), text: sendInText(parsed.data, date), replyTo: parsed.data.email });
  return sent ? Response.json({ status: "sent" }) : Response.json({ status: "failed" }, { status: 502 });
}
