"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { AlertCircle, ArrowRight, CheckCircle2, Info, Mail, MessageCircle, Printer, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { useI18n } from "@/components/i18n/locale-provider";
import {
  CHECKLIST,
  CHECKLIST_EN,
  CONSENT,
  WATER_DAMAGE,
  WATER_DAMAGE_EN,
  makeSendInSchema,
  sendInLines,
  sendInSubject,
  sendInText,
  type SendInValues,
} from "@/lib/send-in";

type Result = { values: SendInValues; date: string; sent: boolean };
type Props = {
  email: string;
  whatsappNumber: string | null;
  termsHref: string;
  shippingAddress: string[];
};

const escape = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/** Opens the filled-in form as a plain page and prints it, to put in the package. */
function printForm(values: SendInValues, date: string, address: string[]) {
  const win = window.open("", "_blank");
  if (!win) return;
  const rows = sendInLines(values, date)
    .map(([k, v]) => `<tr><th>${escape(k)}</th><td>${escape(v).replace(/\n/g, "<br>")}</td></tr>`)
    .join("");
  win.document.write(`<!doctype html><html lang="nl"><head><meta charset="utf-8"><title>Reparatieformulier Phone Repairs</title>
<style>body{font:14px/1.45 "Open Sans",Arial,sans-serif;color:#222;margin:32px}h1{font-size:20px;margin:0 0 4px}p{margin:0 0 16px;color:#515151}
table{border-collapse:collapse;width:100%}th,td{border:1px solid #cdd4cf;padding:6px 8px;text-align:left;vertical-align:top}th{width:32%;background:#f1f4f2;font-weight:600}
.addr{margin-top:20px;padding:12px;border:2px solid #106f31;border-radius:8px;display:inline-block}</style></head><body>
<h1>REPARATIEFORMULIER – Telefoon opsturen naar Phone Repairs</h1><p>073 822 0013 | info@phonerepairs.nl | www.phonerepairs.nl</p>
<table>${rows}</table><div class="addr"><strong>Verzendadres</strong><br>${address.map(escape).join("<br>")}</div>
<script>window.onload=function(){window.print()}</script></body></html>`);
  win.document.close();
}

export function SendInForm({ email, whatsappNumber, termsHref, shippingAddress }: Props) {
  const { locale, t } = useI18n();
  const english = locale === "en";
  const schema = useMemo(() => makeSendInSchema(t), [t]);
  const [result, setResult] = useState<Result | null>(null);
  const [failed, setFailed] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { checklist: [], website: "" } });

  useEffect(() => {
    if (result) resultRef.current?.focus();
  }, [result]);

  const onSubmit = async (values: SendInValues) => {
    setFailed(false);
    const date = new Intl.DateTimeFormat("nl-NL", { dateStyle: "long", timeStyle: "short", timeZone: "Europe/Amsterdam" }).format(new Date());
    const response = await fetch("/api/opsturen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    }).catch(() => null);
    const status = (await response?.json().catch(() => null))?.status;
    // "Sent" only when the server confirms the mail service accepted it.
    if (status === "failed") setFailed(true);
    setResult({ values, date, sent: status === "sent" });
  };

  if (result) {
    const body = sendInText(result.values, result.date);
    const mailto = `mailto:${email}?subject=${encodeURIComponent(sendInSubject(result.values))}&body=${encodeURIComponent(body)}`;
    const whatsapp = whatsappNumber ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(body)}` : null;
    return (
      <div ref={resultRef} tabIndex={-1} role="status" className="outline-none">
        {result.sent ? (
          <span className="grid size-12 place-items-center rounded-2xl bg-accent-soft text-accent-strong ring-1 ring-line">
            <CheckCircle2 className="size-6" aria-hidden />
          </span>
        ) : (
          <span className="grid size-12 place-items-center rounded-2xl bg-warning-soft text-warning ring-1 ring-amber-200">
            <Info className="size-6" aria-hidden />
          </span>
        )}
        <h3 className="mt-6 text-title font-semibold text-ink">
          {result.sent
            ? t("Je formulier is verstuurd", "Your form has been sent")
            : t("Je formulier is nog niet verstuurd", "Your form has not been sent yet")}
        </h3>
        <p className="mt-3 leading-relaxed text-muted">
          {result.sent
            ? t(
                "Phone Repairs heeft je gegevens ontvangen. Print het formulier en stuur het mee in je pakket.",
                "Phone Repairs has received your details. Print the form and include it in your package.",
              )
            : failed
              ? t(
                  "Er ging iets mis bij het versturen. Stuur je formulier via WhatsApp of e-mail (alles is al ingevuld) en print het om mee te sturen.",
                  "Something went wrong while sending. Send your form via WhatsApp or e-mail (everything is filled in) and print it to include.",
                )
              : t(
                  "Het online formulier is nog niet gekoppeld aan de mailbox van Phone Repairs. Stuur je formulier via WhatsApp of e-mail (alles is al ingevuld) en print het om mee te sturen.",
                  "The online form is not connected to the Phone Repairs mailbox yet. Send your form via WhatsApp or e-mail (everything is filled in) and print it to include.",
                )}
        </p>
        <div className="mt-6 rounded-2xl bg-mist p-5 text-sm">
          <p className="font-semibold text-ink">{t("Verzendadres", "Shipping address")}</p>
          <address className="mt-1 not-italic text-ink-soft">
            {shippingAddress.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </address>
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button type="button" size="lg" variant={result.sent ? "primary" : "secondary"} onClick={() => printForm(result.values, result.date, shippingAddress)}>
            <Printer aria-hidden />
            {t("Formulier printen", "Print form")}
          </Button>
          {!result.sent && whatsapp && (
            <Button asChild size="lg">
              <a href={whatsapp} target="_blank" rel="noopener noreferrer">
                <MessageCircle aria-hidden />
                {t("Verstuur via WhatsApp", "Send via WhatsApp")}
              </a>
            </Button>
          )}
          {!result.sent && (
            <Button asChild size="lg" variant="ghost">
              <a href={mailto}>
                <Mail aria-hidden />
                {t("Verstuur via e-mail", "Send via e-mail")}
              </a>
            </Button>
          )}
        </div>
        <button
          type="button"
          onClick={() => {
            reset();
            setResult(null);
          }}
          className="mt-5 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"
        >
          <RotateCcw className="size-3.5" aria-hidden />
          {t("Nieuw formulier", "New form")}
        </button>
      </div>
    );
  }

  const errorCount = Object.keys(errors).length;
  const field = (name: keyof SendInValues, label: string, props: React.ComponentProps<typeof Input> = {}, required = false) => (
    <Field label={required ? `${label} *` : label} id={`si-${name}`} error={errors[name]?.message as string | undefined}>
      <Input
        id={`si-${name}`}
        {...(errors[name] ? { "aria-invalid": true, "aria-describedby": `si-${name}-error` } : {})}
        {...(required ? { "aria-required": true } : {})}
        {...props}
        {...register(name)}
      />
    </Field>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">
      {errorCount > 0 && (
        <p role="alert" className="flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm text-danger ring-1 ring-red-200">
          <AlertCircle className="size-4 shrink-0" aria-hidden />
          {errorCount === 1
            ? t("Controleer het gemarkeerde veld.", "Please check the highlighted field.")
            : t(`Controleer de ${errorCount} gemarkeerde velden.`, `Please check the ${errorCount} highlighted fields.`)}
        </p>
      )}

      <fieldset className="space-y-5">
        <legend className="mb-4 text-lg font-semibold text-ink">{t("1. Jouw gegevens en retouradres", "1. Your details and return address")}</legend>
        {field("name", t("Voor- en achternaam", "First and last name"), { autoComplete: "name" }, true)}
        {field("company", t("Bedrijfsnaam (optioneel)", "Company name (optional)"), { autoComplete: "organization" })}
        <div className="grid gap-5 sm:grid-cols-[1fr_10rem]">
          {field("street", t("Straat en huisnummer", "Street and house number"), { autoComplete: "address-line1" }, true)}
          {field("addition", t("Toevoeging", "Addition"), { autoComplete: "address-line2" })}
        </div>
        <div className="grid gap-5 sm:grid-cols-[10rem_1fr]">
          {field("postcode", t("Postcode", "Postcode"), { autoComplete: "postal-code" }, true)}
          {field("city", t("Woonplaats en land", "Town and country"), { autoComplete: "address-level2" }, true)}
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {field("phone", t("Telefoonnummer", "Phone number"), { type: "tel", autoComplete: "tel", inputMode: "tel" }, true)}
          {field("email", t("E-mailadres", "E-mail address"), { type: "email", autoComplete: "email" }, true)}
        </div>
      </fieldset>

      <fieldset className="space-y-5 border-t border-line pt-8">
        <legend className="mb-4 text-lg font-semibold text-ink">{t("2. Jouw toestel", "2. Your device")}</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          {field("brand", t("Merk", "Brand"), { placeholder: t("Bijvoorbeeld Apple", "For example Apple") }, true)}
          {field("model", t("Model / type", "Model / type"), { placeholder: t("Bijvoorbeeld iPhone 15", "For example iPhone 15") }, true)}
          {field("color", t("Kleur", "Colour"))}
          {field("imei", t("IMEI / serienummer (indien bekend)", "IMEI / serial number (if known)"))}
        </div>
        <div>
          {field("passcode", t("Toegangscode (optioneel)", "Passcode (optional)"), { autoComplete: "off" })}
          <p className="mt-2 text-sm text-muted">
            {t(
              "De code gebruiken we om je telefoon te testen. Liever niet online? Laat het leeg en schrijf de code of teken je patroon op de afdruk.",
              "We use the code to test your phone. Rather not online? Leave it empty and write the code or draw your pattern on the printout.",
            )}
          </p>
        </div>
        <fieldset aria-describedby={errors.waterDamage ? "si-waterDamage-error" : undefined}>
          <legend className="mb-3 text-sm font-medium text-ink">
            {t("Waterschade of contact met vloeistof? *", "Water damage or contact with liquid? *")}
          </legend>
          <div className="flex flex-wrap gap-2">
            {WATER_DAMAGE.map((v) => (
              <label
                key={v}
                className="flex cursor-pointer items-center gap-2.5 rounded-2xl px-4 py-3 text-[0.9375rem] text-ink ring-1 ring-line transition-colors has-[:checked]:bg-accent-soft has-[:checked]:ring-accent has-[:focus-visible]:ring-2"
              >
                <input type="radio" value={v} {...register("waterDamage")} className="size-4 accent-[var(--color-accent)]" />
                {english ? WATER_DAMAGE_EN[v] : v}
              </label>
            ))}
          </div>
          {errors.waterDamage && <FieldError id="si-waterDamage-error" message={errors.waterDamage.message} />}
        </fieldset>
      </fieldset>

      <fieldset className="border-t border-line pt-8">
        <legend className="mb-4 text-lg font-semibold text-ink">{t("3. Klacht en gewenste reparatie", "3. Problem and desired repair")}</legend>
        <Field
          label={t("Omschrijf de klacht en wat je wilt laten repareren *", "Describe the problem and what you want repaired *")}
          id="si-complaint"
          error={errors.complaint?.message}
        >
          <Textarea
            id="si-complaint"
            aria-required
            placeholder={t(
              "Wat werkt niet, sinds wanneer en wanneer treedt het probleem op? Vermeld ook zichtbare schade.",
              "What doesn't work, since when and when does the problem occur? Also mention visible damage.",
            )}
            {...(errors.complaint ? { "aria-invalid": true, "aria-describedby": "si-complaint-error" } : {})}
            {...register("complaint")}
          />
        </Field>
      </fieldset>

      <fieldset className="border-t border-line pt-8">
        <legend className="mb-4 text-lg font-semibold text-ink">{t("4. Klaar voor verzending", "4. Ready to ship")}</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {CHECKLIST.map((item) => (
            <label key={item} className="flex cursor-pointer items-start gap-3 rounded-2xl px-4 py-3 text-[0.9375rem] text-ink ring-1 ring-line has-[:checked]:bg-accent-soft has-[:checked]:ring-accent">
              <input type="checkbox" value={item} {...register("checklist")} className="mt-1 size-4 shrink-0 accent-[var(--color-accent)]" />
              {english ? CHECKLIST_EN[item] : item}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="border-t border-line pt-8">
        <legend className="mb-4 text-lg font-semibold text-ink">{t("5. Akkoord", "5. Agreement")}</legend>
        <label className="flex cursor-pointer items-start gap-3 text-[0.9375rem] leading-relaxed text-ink">
          <input
            type="checkbox"
            {...register("consent")}
            {...(errors.consent ? { "aria-invalid": true, "aria-describedby": "si-consent-error" } : {})}
            className="mt-1 size-4 shrink-0 accent-[var(--color-accent)]"
          />
          <span lang="nl">{CONSENT} *</span>
        </label>
        {english && (
          <p className="mt-2 text-sm text-muted">
            I give permission to examine my phone and first receive a quote. The repair is carried out after my approval. I have read the
            Phone Repairs terms and conditions.
          </p>
        )}
        <a href={termsHref} target="_blank" rel="noopener" className="mt-3 inline-block text-sm font-medium text-accent-strong underline underline-offset-4 hover:text-accent">
          {t("Algemene voorwaarden (pdf)", "Terms and conditions (pdf, Dutch)")}
        </a>
        {errors.consent && <FieldError id="si-consent-error" message={errors.consent.message} />}
      </fieldset>

      {/* Honeypot: hidden from people and assistive technology. */}
      <div aria-hidden className="absolute -left-[9999px] h-0 overflow-hidden">
        <label htmlFor="si-website">Website</label>
        <input id="si-website" tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>

      <div className="flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          {t("* Verplicht veld. We gebruiken je gegevens alleen voor je reparatie.", "* Required field. We only use your details for your repair.")}
        </p>
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? t("Bezig met versturen…", "Sending…") : t("Formulier versturen", "Send form")}
          <ArrowRight aria-hidden />
        </Button>
      </div>
    </form>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-2 flex items-center gap-1.5 text-sm text-danger">
      <AlertCircle className="size-3.5 shrink-0" aria-hidden />
      {message}
    </p>
  );
}

function Field({ label, id, error, children }: { label: string; id: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      {children}
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}
