"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { AlertCircle, ArrowRight, Info, Mail, Phone, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";

export type FormDevice = { id: string; name: string; brand: string };
export type FormRepair = { id: string; name: string };

const PREFERENCES = ["Zo snel mogelijk", "Doordeweeks overdag", "Doordeweeks ’s avonds", "In het weekend"] as const;

const schema = z.object({
  name: z.string().trim().min(2, "Vul je naam in."),
  phone: z
    .string()
    .trim()
    .regex(/^(\+31|0031|0)[1-9][0-9\s-]{7,12}$/, "Vul een geldig Nederlands telefoonnummer in."),
  email: z.email("Vul een geldig e-mailadres in."),
  device: z.string().min(1, "Kies je toestel of kies ‘Ander toestel’."),
  otherDevice: z.string().trim().optional(),
  repair: z.string().min(1, "Kies het soort reparatie."),
  preference: z.enum(PREFERENCES),
  message: z.string().trim().max(1000, "Maximaal 1000 tekens.").optional(),
}).refine((v) => v.device !== "other" || (v.otherDevice && v.otherDevice.length > 1), {
  path: ["otherDevice"],
  message: "Vul het merk en model van je toestel in.",
});

type Values = z.infer<typeof schema>;

export function AppointmentForm({
  devices,
  repairs,
  email,
  phone,
}: {
  devices: FormDevice[];
  repairs: FormRepair[];
  email: string;
  phone: { display: string; href: string };
}) {
  const params = useSearchParams();
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
      `Naam: ${submitted.name}`,
      `Telefoon: ${submitted.phone}`,
      `E-mail: ${submitted.email}`,
      `Toestel: ${deviceName}`,
      `Reparatie: ${repairName}`,
      `Voorkeur: ${submitted.preference}`,
      submitted.message ? `\nToelichting:\n${submitted.message}` : "",
    ].join("\n");
    const mailto = `mailto:${email}?subject=${encodeURIComponent(
      `Afspraakverzoek: ${repairName} ${deviceName}`,
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
        <h2 className="mt-6 text-title font-semibold text-ink">Je aanvraag is nog niet verstuurd</h2>
        <p className="mt-3 leading-relaxed text-muted">
          Dit is een demo van de nieuwe website. Het formulier is nog niet gekoppeld aan een agenda of mailserver.
          Verstuur je aanvraag via e-mail (alles is al ingevuld) of bel direct.
        </p>
        <dl className="mt-6 grid gap-x-6 gap-y-3 rounded-2xl bg-mist p-5 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted">Toestel</dt>
            <dd className="font-medium text-ink">{deviceName}</dd>
          </div>
          <div>
            <dt className="text-muted">Reparatie</dt>
            <dd className="font-medium text-ink">{repairName}</dd>
          </div>
          <div>
            <dt className="text-muted">Voorkeur</dt>
            <dd className="font-medium text-ink">{submitted.preference}</dd>
          </div>
          <div>
            <dt className="text-muted">Contact</dt>
            <dd className="font-medium break-all text-ink">{submitted.email}</dd>
          </div>
        </dl>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <a href={mailto}>
              <Mail aria-hidden />
              Verstuur via e-mail
            </a>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <a href={phone.href}>
              <Phone aria-hidden />
              Bel {phone.display}
            </a>
          </Button>
        </div>
        <button
          type="button"
          onClick={() => setSubmitted(null)}
          className="mt-5 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"
        >
          <RotateCcw className="size-3.5" aria-hidden />
          Gegevens aanpassen
        </button>
        <button
          type="button"
          onClick={() => {
            reset();
            setSubmitted(null);
          }}
          className="mt-5 ml-5 text-sm text-muted hover:text-ink"
        >
          Opnieuw beginnen
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
          Controleer {errorCount === 1 ? "het gemarkeerde veld" : `de ${errorCount} gemarkeerde velden`}.
        </p>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Toestel" id="device" error={errors.device?.message}>
          <Select id="device" {...invalid("device")} {...register("device")}>
            <option value="">Kies je toestel</option>
            {brands.map(([brand, list]) => (
              <optgroup key={brand} label={brand}>
                {list.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </optgroup>
            ))}
            <option value="other">Ander toestel</option>
          </Select>
        </Field>
        <Field label="Reparatie" id="repair" error={errors.repair?.message}>
          <Select id="repair" {...invalid("repair")} {...register("repair")}>
            <option value="">Kies een reparatie</option>
            {repairs.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      {deviceValue === "other" && (
        <Field label="Merk en model" id="otherDevice" error={errors.otherDevice?.message}>
          <Input id="otherDevice" placeholder="Bijvoorbeeld Google Pixel 8" {...invalid("otherDevice")} {...register("otherDevice")} />
        </Field>
      )}

      <Field label="Naam" id="name" error={errors.name?.message}>
        <Input id="name" autoComplete="name" {...invalid("name")} {...register("name")} />
      </Field>
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Telefoonnummer" id="phone" error={errors.phone?.message}>
          <Input id="phone" type="tel" autoComplete="tel" inputMode="tel" {...invalid("phone")} {...register("phone")} />
        </Field>
        <Field label="E-mailadres" id="email" error={errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" {...invalid("email")} {...register("email")} />
        </Field>
      </div>

      <fieldset>
        <legend className="mb-3 text-sm font-medium text-ink">Wanneer komt het je het beste uit?</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {PREFERENCES.map((p) => (
            <label
              key={p}
              className="flex cursor-pointer items-center gap-3 rounded-2xl px-4 py-3.5 text-[0.9375rem] text-ink ring-1 ring-line transition-colors has-[:checked]:bg-accent-soft has-[:checked]:ring-accent has-[:focus-visible]:ring-2"
            >
              <input type="radio" value={p} {...register("preference")} className="size-4 accent-[var(--color-accent)]" />
              {p}
            </label>
          ))}
        </div>
        <p className="mt-2 text-sm text-muted">Dit is een voorkeur. Het definitieve tijdstip wordt samen afgesproken.</p>
      </fieldset>

      <Field label="Toelichting (optioneel)" id="message" error={errors.message?.message}>
        <Textarea id="message" placeholder="Wat is er gebeurd en wat werkt er niet meer?" {...invalid("message")} {...register("message")} />
      </Field>

      <div className="flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">We gebruiken je gegevens alleen om je afspraak in te plannen.</p>
        <Button type="submit" size="lg" disabled={isSubmitting}>
          Afspraak aanvragen
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
