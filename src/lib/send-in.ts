import { z } from "zod";
import type { Translate } from "@/lib/i18n";

/**
 * The send-in form ("opstuurformulier"): the fields of the shop's own
 * Reparatieformulier-Phone-Repairs.doc. Shared by the form (client) and /api/opsturen (server).
 * Stored values stay Dutch: they go to the shop.
 */
export const WATER_DAMAGE = ["Nee", "Ja", "Onbekend"] as const;
export const WATER_DAMAGE_EN: Record<(typeof WATER_DAMAGE)[number], string> = { Nee: "No", Ja: "Yes", Onbekend: "Unknown" };

/** The ticks of "Klaar voor verzending" on the paper form. */
export const CHECKLIST = [
  "Back-up gemaakt, indien mogelijk",
  "Simkaart en geheugenkaart verwijderd",
  "Geen oplader, kabels of hoesje meegestuurd",
  "Telefoon stevig verpakt en formulier bijgevoegd",
] as const;
export const CHECKLIST_EN: Record<(typeof CHECKLIST)[number], string> = {
  "Back-up gemaakt, indien mogelijk": "Backup made, if possible",
  "Simkaart en geheugenkaart verwijderd": "SIM card and memory card removed",
  "Geen oplader, kabels of hoesje meegestuurd": "No charger, cables or case included",
  "Telefoon stevig verpakt en formulier bijgevoegd": "Phone packed securely and form included",
};

/** Consent text of the paper form, word for word. */
export const CONSENT =
  "Ik geef toestemming om mijn telefoon te onderzoeken en ontvang eerst een prijsopgave. De reparatie wordt na mijn akkoord uitgevoerd. Ik heb kennisgenomen van de algemene voorwaarden van Phone Repairs.";

const text = (max: number) => z.string().trim().max(max);

export function makeSendInSchema(t: Translate) {
  const required = (max: number, message: string) => text(max).min(1, message);
  return z.object({
    name: required(120, t("Vul je voor- en achternaam in.", "Please enter your first and last name.")),
    company: text(120).optional(),
    street: required(160, t("Vul je straat en huisnummer in.", "Please enter your street and house number.")),
    addition: text(40).optional(),
    postcode: required(16, t("Vul je postcode in.", "Please enter your postcode.")),
    city: required(120, t("Vul je woonplaats en land in.", "Please enter your town and country.")),
    phone: z
      .string()
      .trim()
      .regex(/^\+?[0-9][0-9\s()-]{7,18}$/, t("Vul een geldig telefoonnummer in.", "Please enter a valid phone number.")),
    email: z.email(t("Vul een geldig e-mailadres in.", "Please enter a valid e-mail address.")).max(160),
    brand: required(60, t("Vul het merk van je toestel in.", "Please enter the brand of your device.")),
    model: required(80, t("Vul het model of type in.", "Please enter the model or type.")),
    color: text(40).optional(),
    imei: text(40).optional(),
    passcode: text(40).optional(),
    waterDamage: z.enum(WATER_DAMAGE, t("Kies een antwoord.", "Please choose an answer.")),
    complaint: required(2000, t("Omschrijf de klacht en wat je wilt laten repareren.", "Describe the problem and what you want repaired.")).max(
      2000,
      t("Maximaal 2000 tekens.", "Maximum 2000 characters."),
    ),
    checklist: z.array(z.enum(CHECKLIST)).default([]),
    consent: z.literal(true, t("Geef akkoord om je formulier te versturen.", "Please agree to send your form.")),
    /** Honeypot: hidden from people, filled in by bots. */
    website: z.string().max(0).optional(),
  });
}

export type SendInValues = z.infer<ReturnType<typeof makeSendInSchema>>;

/** The form as plain-text lines in the order of the paper form (Dutch, for the shop). */
export function sendInLines(v: SendInValues, date: string): [string, string][] {
  const rows: [string, string | undefined][] = [
    ["Voor- en achternaam", v.name],
    ["Bedrijfsnaam", v.company],
    ["Straat en huisnummer", v.street],
    ["Toevoeging", v.addition],
    ["Postcode", v.postcode],
    ["Woonplaats en land", v.city],
    ["Telefoonnummer", v.phone],
    ["E-mailadres", v.email],
    ["Merk", v.brand],
    ["Model / type", v.model],
    ["Kleur", v.color],
    ["IMEI / serienummer", v.imei],
    ["Toegangscode", v.passcode],
    ["Waterschade of contact met vloeistof", v.waterDamage],
    ["Klacht en gewenste reparatie", v.complaint],
    ["Klaar voor verzending", v.checklist.length ? v.checklist.join("; ") : "—"],
    ["Akkoord", `${CONSENT} (online akkoord gegeven op ${date})`],
  ];
  return rows.filter((r): r is [string, string] => Boolean(r[1]));
}

export const sendInText = (v: SendInValues, date: string) =>
  ["REPARATIEFORMULIER – Telefoon opsturen naar Phone Repairs", "", ...sendInLines(v, date).map(([k, val]) => `${k}: ${val}`)].join("\n");

export const sendInSubject = (v: SendInValues) =>
  `Opstuurformulier: ${v.brand} ${v.model} – ${v.name}`.replace(/[\r\n]+/g, " ").slice(0, 160);
