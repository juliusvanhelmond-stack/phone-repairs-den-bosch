"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { AlertCircle, ArrowRight, Info, Mail, MessageCircle, Phone, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { useI18n } from "@/components/i18n/locale-provider";
import type { Translate } from "@/lib/i18n";

export type FormDevice = { id: string; name: string; brand: string };
export type FormRepair = { id: string; name: string };

/** Stored values stay Dutch (they go to the shop); labels are translated. */
const PREFERENCES = ["Zo snel mogelijk", "Doordeweeks overdag", "Doordeweeks ’s avonds", "In het weekend"] as const;
const PREFERENCE_EN: Record<(typeof PREFERENCES)[number], string> = {
  "Zo snel mogelijk": "As soon as possible",
  "Doordeweeks overdag": "Weekdays, daytime",
  "Doordeweeks ’s avonds": "Weekday evenings",
  "In het weekend": "At the weekend",
};

function makeSchema(t: Translate, english: boolean) {
  return z
    .object({
      name: z.string().trim().min(2, t("Vul je naam in.", "Please enter your name.")),
      // Dutch numbers on the Dutch site; any international number on the English site.
      phone: english
        ? z.string().trim().regex(/^\+?[0-9][0-9\s-]{7,16}$/, "Please enter a valid phone number.")
        : z
            .string()
            .trim()
            .regex(/^(\+31|0031|0)[1-9][0-9\s-]{7,12}$/, "Vul een geldig Nederlands telefoonnummer in."),
      email: z.email(t("Vul een geldig e-mailadres in.", "Please enter a valid e-mail address.")),
      device: z.string().min(1, t("Kies je toestel of kies ‘Ander toestel’.", "Choose your device or choose ‘Other device’.")),
      otherDevice: z.string().trim().optional(),
      repair: z.string().min(1, t("Kies het soort reparatie.", "Choose the type of repair.")),
      preference: z.enum(PREFERENCES),
      message: z.string().trim().max(1000, t("Maximaal 1000 tekens.", "Maximum 1000 characters.")).optional(),
    })
    .refine((v) => v.device !== "other" || (v.otherDevice && v.otherDevice.length > 1), {
      path: ["otherDevice"],
      message: t("Vul het merk en model van je toestel in.", "Enter the brand and model of your device."),
    });
}

type Values = z.infer<ReturnType<typeof makeSchema>>;

export function AppointmentForm({
  devices,
  repairs,
  email,
  phone,
  whatsappNumber,
}: {
  devices: FormDevice[];
  repairs: FormRepair[];
  email: string;
  phone: { display: string; href: string };
  /** International number without "+" for wa.me links; null hides the WhatsApp option. */
  whatsappNumber: string | null;
}) {
  const params = useSearchParams();
  const { locale, t } = useI18n();
  const schema = useMemo(() => makeSchema(t, locale === "en"), [t, locale]);
  const prefLabel = (p: (typeof PREFERENCES)[number]) => (locale === "en" ? PREFERENCE_EN[p] : p);
  const [submitted, setSubmitted] = useState<Values | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const brands = useMemo(() => {
    const map = new Map<string, FormDevice[]>();
    for (const d of devices) map.set(d.brand, [...(map.get(d.brand) ?? []), d]);
    return [...map.entries()];
  }, [devices]);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { device: "", repair: "", preference: "Zo snel mogelijk", message: "" },
  });

  // Prefill from the device finder or a device page (?toestel=…&reparatie=…).
  useEffect(() => {
    const device = params.get("toestel");
    const repair = params.get("reparatie");
    if (device && devices.some((d) => d.id === device)) setValue("device", device);
    if (repair && repairs.some((r) => r.id === repair)) setValue("repair", repair);
  }, [params, devices, repairs, setValue]);

  useEffect(() => {
    if (submitted) resultRef.current?.focus();
  }, [submitted]);

  const deviceValue = useWatch({ control, name: "device" });

  const onSubmit = (values: Values) => {
    // No booking backend is connected in this demo, so nothing is sent.
    setSubmitted(values);
  };

  if (submitted) {
    const deviceName =
      submitted.device === "other"
        ? submitted.otherDevice
        : devices.find((d) => d.id === submitted.device)?.name ?? submitted.device;
    const repairName = repairs.find((r) => r.id === submitted.repair)?.name ?? submitted.repair;
    const body = [
      `${t("Naam", "Name")}: ${submitted.name}`,
      `${t("Telefoon", "Phone")}: ${submitted.phone}`,
      `E-mail: ${submitted.email}`,
      `${t("Toestel", "Device")}: ${deviceName}`,
      `${t("Reparatie", "Repair")}: ${repairName}`,
      `${t("Voorkeur", "Preference")}: ${prefLabel(submitted.preference)}`,
      submitted.message ? `\n${t("Toelichting", "Details")}:\n${submitted.message}` : "",
    ].join("\n");
    const greeting = t("Hoi Phone Repairs, ik wil graag een afspraak maken.", "Hi Phone Repairs, I would like to make an appointment.");
    const whatsapp = whatsappNumber
      ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`${greeting}\n\n${body}`)}`
      : null;
    const mailto = `mailto:${email}?subject=${encodeURIComponent(
      `${t("Afspraakverzoek", "Appointment request")}: ${repairName} ${deviceName}`,
    )}&body=${encodeURIComponent(body)}`;

    return (
      <div
        ref={resultRef}
        tabIndex={-1}
        role="status"
        className="rounded-[var(--radius-card)] bg-white p-6 ring-1 ring-line outline-none sm:p-8"
      >
        <span className="grid size-12 place-items-center rounded-2xl bg-warning-soft text-warning ring-1 ring-amber-200">
          <Info className="size-6" aria-hidden />
        </span>
        <h2 className="mt-6 text-title font-semibold text-ink">
          {t("Je aanvraag is nog niet verstuurd", "Your request has not been sent yet")}
        </h2>
        <p className="mt-3 leading-relaxed text-muted">
          {t(
            "Het formulier is nog niet gekoppeld aan een agenda. Verstuur je aanvraag zelf via WhatsApp of e-mail (alles is al ingevuld), of bel direct.",
            "The form is not connected to a calendar yet. Send your request yourself via WhatsApp or e-mail (everything is filled in), or call directly.",
          )}
        </p>
        <dl className="mt-6 grid gap-x-6 gap-y-3 rounded-2xl bg-mist p-5 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted">{t("Toestel", "Device")}</dt>
            <dd className="font-medium text-ink">{deviceName}</dd>
          </div>
          <div>
            <dt className="text-muted">{t("Reparatie", "Repair")}</dt>
            <dd className="font-medium text-ink">{repairName}</dd>
          </div>
          <div>
            <dt className="text-muted">{t("Voorkeur", "Preference")}</dt>
            <dd className="font-medium text-ink">{prefLabel(submitted.preference)}</dd>
          </div>
          <div>
            <dt className="text-muted">Contact</dt>
            <dd className="font-medium break-all text-ink">{submitted.email}</dd>
          </div>
        </dl>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {whatsapp && (
            <Button asChild size="lg">
              <a href={whatsapp} target="_blank" rel="noopener noreferrer">
                <MessageCircle aria-hidden />
                {t("Verstuur via WhatsApp", "Send via WhatsApp")}
              </a>
            </Button>
          )}
          <Button asChild size="lg" variant={whatsapp ? "secondary" : "primary"}>
            <a href={phone.href}>
              <Phone aria-hidden />
              {t("Bel", "Call")} {phone.display}
            </a>
          </Button>
          <Button asChild size="lg" variant="ghost">
            <a href={mailto}>
              <Mail aria-hidden />
              {t("Verstuur via e-mail", "Send via e-mail")}
            </a>
          </Button>
        </div>
        <button
          type="button"
          onClick={() => setSubmitted(null)}
          className="mt-5 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"
        >
          <RotateCcw className="size-3.5" aria-hidden />
          {t("Gegevens aanpassen", "Edit details")}
        </button>
        <button
          type="button"
          onClick={() => {
            reset();
            setSubmitted(null);
          }}
          className="mt-5 ml-5 text-sm text-muted hover:text-ink"
        >
          {t("Opnieuw beginnen", "Start again")}
        </button>
      </div>
    );
  }

  const errorCount = Object.keys(errors).length;
  const invalid = (field: keyof Values) =>
    errors[field] ? { "aria-invalid": true, "aria-describedby": `${field}-error` } : {};

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      {errorCount > 0 && (
        <p role="alert" className="flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm text-danger ring-1 ring-red-200">
          <AlertCircle className="size-4 shrink-0" aria-hidden />
          {errorCount === 1
            ? t("Controleer het gemarkeerde veld.", "Please check the highlighted field.")
            : t(`Controleer de ${errorCount} gemarkeerde velden.`, `Please check the ${errorCount} highlighted fields.`)}
        </p>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label={t("Toestel", "Device")} id="device" error={errors.device?.message}>
          <Select id="device" {...invalid("device")} {...register("device")}>
            <option value="">{t("Kies je toestel", "Choose your device")}</option>
            {brands.map(([brand, list]) => (
              <optgroup key={brand} label={brand}>
                {list.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </optgroup>
            ))}
            <option value="other">{t("Ander toestel", "Other device")}</option>
          </Select>
        </Field>
        <Field label={t("Reparatie", "Repair")} id="repair" error={errors.repair?.message}>
          <Select id="repair" {...invalid("repair")} {...register("repair")}>
            <option value="">{t("Kies een reparatie", "Choose a repair")}</option>
            {repairs.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      {deviceValue === "other" && (
        <Field label={t("Merk en model", "Brand and model")} id="otherDevice" error={errors.otherDevice?.message}>
          <Input id="otherDevice" placeholder={t("Bijvoorbeeld Google Pixel 8", "For example Google Pixel 8")} {...invalid("otherDevice")} {...register("otherDevice")} />
        </Field>
      )}

      <Field label={t("Naam", "Name")} id="name" error={errors.name?.message}>
        <Input id="name" autoComplete="name" {...invalid("name")} {...register("name")} />
      </Field>
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label={t("Telefoonnummer", "Phone number")} id="phone" error={errors.phone?.message}>
          <Input id="phone" type="tel" autoComplete="tel" inputMode="tel" {...invalid("phone")} {...register("phone")} />
        </Field>
        <Field label={t("E-mailadres", "E-mail address")} id="email" error={errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" {...invalid("email")} {...register("email")} />
        </Field>
      </div>

      <fieldset>
        <legend className="mb-3 text-sm font-medium text-ink">{t("Wanneer komt het je het beste uit?", "When suits you best?")}</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {PREFERENCES.map((p) => (
            <label
              key={p}
              className="flex cursor-pointer items-center gap-3 rounded-2xl px-4 py-3.5 text-[0.9375rem] text-ink ring-1 ring-line transition-colors has-[:checked]:bg-accent-soft has-[:checked]:ring-accent has-[:focus-visible]:ring-2"
            >
              <input type="radio" value={p} {...register("preference")} className="size-4 accent-[var(--color-accent)]" />
              {prefLabel(p)}
            </label>
          ))}
        </div>
        <p className="mt-2 text-sm text-muted">
          {t("Dit is een voorkeur. Het definitieve tijdstip wordt samen afgesproken.", "This is a preference. The final time is agreed together.")}
        </p>
      </fieldset>

      <Field label={t("Toelichting (optioneel)", "Details (optional)")} id="message" error={errors.message?.message}>
        <Textarea id="message" placeholder={t("Wat is er gebeurd en wat werkt er niet meer?", "What happened and what no longer works?")} {...invalid("message")} {...register("message")} />
      </Field>

      <div className="flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          {t("We gebruiken je gegevens alleen om je afspraak in te plannen.", "We only use your details to schedule your appointment.")}
        </p>
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {t("Afspraak aanvragen", "Request appointment")}
          <ArrowRight aria-hidden />
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  id,
  error,
  children,
}: {
  label: string;
  id: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-2 flex items-center gap-1.5 text-sm text-danger">
          <AlertCircle className="size-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      )}
    </div>
  );
}
