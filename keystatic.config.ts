/**
 * CMS (Keystatic) for Phone Repairs: edits the files in src/content/ (one JSON file per entry).
 * Every save is a Git commit; Vercel then rebuilds the site (`npm run content` merges the files).
 *
 * Storage: local files in development; in production GitHub, once the GitHub App is set up
 * (NEXT_PUBLIC_KEYSTATIC_STORAGE=github plus the KEYSTATIC_* secrets, see docs/cms.md).
 * Prices are deliberately not editable here: they only come from the shop's price lists.
 */
import { collection, config, fields } from "@keystatic/core";

const repo = (process.env.NEXT_PUBLIC_KEYSTATIC_REPO ?? "juliusvanhelmond-stack/phone-repairs-den-bosch").split("/");

const lines = (label: string, description?: string) =>
  fields.array(fields.text({ label, multiline: true }), { label, description, itemLabel: (p) => p.value.slice(0, 80) || "(leeg)" });

export default config({
  storage:
    process.env.NEXT_PUBLIC_KEYSTATIC_STORAGE === "github"
      ? { kind: "github", repo: { owner: repo[0], name: repo[1] } }
      : { kind: "local" },
  ui: {
    brand: { name: "Phone Repairs" },
    navigation: { Inhoud: ["pages", "seo"] },
  },
  collections: {
    pages: collection({
      label: "Pagina's (plaats-, info- en FAQ-pagina's)",
      path: "src/content/pages/*",
      format: { data: "json" },
      slugField: "id",
      columns: ["title", "path"],
      schema: {
        id: fields.slug({
          name: {
            label: "Pagina-ID",
            description: "Korte naam zonder spaties, meestal gelijk aan de URL zonder schuine streep (bijv. telefoon-reparatie-rosmalen).",
            validation: { isRequired: true, pattern: { regex: /^[a-z0-9-]+$/, message: "Alleen kleine letters, cijfers en streepjes." } },
          },
          slug: { label: "Bestandsnaam", description: "Wordt automatisch ingevuld." },
        }),
        path: fields.text({
          label: "URL (pad)",
          description: "Bijv. /telefoon-reparatie-rosmalen of /veelgestelde-vragen/onderwerp. Zonder schuine streep aan het eind.",
          validation: { isRequired: true, pattern: { regex: /^(\/[a-z0-9-]+)+$/, message: "Begin met /, alleen kleine letters, cijfers en streepjes." } },
        }),
        kind: fields.select({
          label: "Soort pagina",
          options: [
            { label: "Info- of dienstpagina", value: "service" },
            { label: "Plaatspagina (werkgebied)", value: "area" },
            { label: "FAQ-onderwerp (onder /veelgestelde-vragen/)", value: "faq-topic" },
          ],
          defaultValue: "area",
        }),
        title: fields.text({ label: "Titel (H1)", validation: { isRequired: true } }),
        eyebrow: fields.text({ label: "Klein kopje boven de titel", description: "Bijv. 'Voor Rosmalen'." }),
        intro: fields.text({ label: "Introductie", multiline: true }),
        seo: fields.object(
          {
            title: fields.text({ label: "SEO-titel", description: "Wordt precies zo gebruikt. Liefst onder de 60 tekens.", validation: { length: { max: 70 } } }),
            description: fields.text({ label: "Meta-omschrijving", multiline: true, validation: { length: { max: 170 } } }),
          },
          { label: "SEO" },
        ),
        place: fields.text({ label: "Plaats (alleen plaatspagina's)", description: "Bijv. Rosmalen. Pagina's met dezelfde plaats worden gegroepeerd." }),
        placeKind: fields.select({
          label: "Plaats of wijk (alleen plaatspagina's)",
          options: [
            { label: "Plaats", value: "plaats" },
            { label: "Wijk in Den Bosch", value: "wijk" },
            { label: "Geen label (regio, winkelcentrum)", value: "" },
          ],
          defaultValue: "plaats",
        }),
        focus: fields.select({
          label: "Onderwerp (alleen plaatspagina's)",
          description: "Bepaalt welke toestellen onder de tekst staan.",
          options: [
            { label: "Telefoon", value: "telefoon" },
            { label: "GSM", value: "gsm" },
            { label: "Smartphone", value: "smartphone" },
            { label: "Mobiel", value: "mobiel" },
            { label: "iPhone", value: "iphone" },
            { label: "iPad", value: "ipad" },
            { label: "Scherm", value: "scherm" },
            { label: "Geen (info- en FAQ-pagina's)", value: "" },
          ],
          defaultValue: "",
        }),
        sections: fields.array(
          fields.object({
            heading: fields.text({ label: "Kop", validation: { isRequired: true } }),
            intro: lines("Alinea's vóór de lijst"),
            bullets: lines("Opsommingstekens", "Begin een regel met ✕ voor een rood kruisje in plaats van een vinkje."),
            steps: lines("Genummerde stappen"),
            body: lines("Alinea's na de lijst"),
            image: fields.object(
              {
                src: fields.text({ label: "Afbeelding (pad)", description: "Alleen bestaande afbeeldingen onder /wp-content/uploads/…" }),
                alt: fields.text({ label: "Alt-tekst" }),
                width: fields.integer({ label: "Breedte (px)" }),
                height: fields.integer({ label: "Hoogte (px)" }),
              },
              { label: "Afbeelding (optioneel)" },
            ),
          }),
          { label: "Blokken", itemLabel: (p) => p.fields.heading.value || "(nieuw blok)" },
        ),
        unconfirmed: lines("Nog niet bevestigd (niet zichtbaar)", "Feiten van de oude pagina die pas na bevestiging worden getoond."),
        legacyUrls: lines("Oude URL's", "Bijv. /telefoon-reparatie-rosmalen/ (met schuine streep)."),
        sources: fields.array(
          fields.object({
            url: fields.url({ label: "URL" }),
            verification: fields.select({
              label: "Herkomst",
              options: [
                { label: "Overgenomen van de huidige site", value: "verified-source" },
                { label: "Zoekmachine-snapshot", value: "search-index" },
                { label: "Bevestigd door Phone Repairs", value: "owner-confirmed" },
              ],
              defaultValue: "owner-confirmed",
            }),
            capturedAt: fields.text({ label: "Datum (JJJJ-MM-DD)" }),
            note: fields.text({ label: "Notitie", multiline: true }),
          }),
          {
            label: "Bronnen",
            description: "Hoeft niet ingevuld te worden: nieuwe pagina's krijgen automatisch 'Bevestigd door Phone Repairs'.",
            itemLabel: (p) => p.fields.url.value ?? "",
          },
        ),
        originalTitle: fields.text({ label: "Titel op de oude site (referentie)" }),
      },
    }),
    seo: collection({
      label: "SEO per URL (titel en omschrijving)",
      path: "src/content/seo/*",
      format: { data: "json" },
      slugField: "path",
      columns: ["path", "title"],
      schema: {
        path: fields.slug({
          name: {
            label: "URL (pad)",
            description: "Elke pagina van de site, bijv. / , /reparaties/apple/iphone-15 of /reparatie/scherm-vervangen.",
            validation: { isRequired: true, pattern: { regex: /^\/[a-z0-9/-]*$/, message: "Begin met /, alleen kleine letters, cijfers, / en streepjes." } },
          },
          slug: {
            label: "Bestandsnaam",
            generate: (path) => path.replace(/^\/+|\/+$/g, "").replace(/\//g, "--") || "home",
          },
        }),
        title: fields.text({
          label: "Titel",
          description: "Vervangt de standaardtitel en wordt precies zo gebruikt. Liefst onder de 60 tekens.",
          validation: { length: { max: 70 } },
        }),
        description: fields.text({ label: "Meta-omschrijving", multiline: true, validation: { length: { max: 170 } } }),
      },
    }),
  },
});
