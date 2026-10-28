/**
 * CMS (Keystatic) for Phone Repairs: edits the files in src/content/ (one JSON file per entry).
 * Every save is a Git commit; Vercel then rebuilds the site (`npm run content` merges the files).
 *
 * Storage: local files in development; in production GitHub, once the GitHub App is set up
 * (NEXT_PUBLIC_KEYSTATIC_STORAGE=github plus the KEYSTATIC_* secrets, see docs/cms.md).
 * Since 2026-10-21 the shop also edits its devices and prices, blog posts and opening hours here
 * (client request), and since 2026-10-27 the FAQ: from then on the CMS is the source of those.
 */
import { collection, config, fields, singleton } from "@keystatic/core";
import brandsJson from "./src/data/brands.json";
import categoriesJson from "./src/data/categories.json";
import repairsJson from "./src/data/repairs.json";

const repo = (process.env.NEXT_PUBLIC_KEYSTATIC_REPO ?? "juliusvanhelmond-stack/phone-repairs-den-bosch").split("/");

const byOrder = <T extends { order: number }>(list: T[]) => [...list].sort((a, b) => a.order - b.order);
const brandOptions = byOrder(brandsJson).map((b) => ({ label: b.id === "apple" ? "Apple (iPhone, iPad, MacBook)" : b.name, value: b.id }));
const categoryOptions = byOrder(categoriesJson).map((c) => ({ label: c.name === "MacBook" ? "MacBook / laptop" : c.name, value: c.id }));
const repairOptions = [
  { label: "Automatisch (op basis van de omschrijving)", value: "auto" },
  ...byOrder(repairsJson).map((r) => ({ label: r.name, value: r.id })),
  { label: "Accessoire (geen reparatie)", value: "accessoire" },
];
const time = (label: string) =>
  fields.text({ label, validation: { pattern: { regex: /^([01]\d|2[0-3]):[0-5]\d$/, message: "Schrijf de tijd als 09:00." } } });
const day = (label: string) =>
  fields.object(
    { gesloten: fields.checkbox({ label: "Gesloten", defaultValue: false }), open: time("Open vanaf"), dicht: time("Open tot") },
    { label, layout: [4, 4, 4] },
  );

const lines = (label: string, description?: string) =>
  fields.array(fields.text({ label, multiline: true }), { label, description, itemLabel: (p) => p.value.slice(0, 80) || "(leeg)" });

export default config({
  storage:
    process.env.NEXT_PUBLIC_KEYSTATIC_STORAGE === "github"
      ? { kind: "github", repo: { owner: repo[0], name: repo[1] } }
      : { kind: "local" },
  ui: {
    brand: { name: "Phone Repairs" },
    navigation: {
      Winkel: ["toestellen", "openingstijden", "mededeling"],
      Inhoud: ["faq", "blog", "pages", "seo"],
    },
  },
  singletons: {
    // Opening hours, always by appointment (client request 2026-10-21).
    openingstijden: singleton({
      label: "Openingstijden",
      path: "src/content/openingstijden",
      format: { data: "json" },
      schema: {
        maandag: day("Maandag"),
        dinsdag: day("Dinsdag"),
        woensdag: day("Woensdag"),
        donderdag: day("Donderdag"),
        vrijdag: day("Vrijdag"),
        zaterdag: day("Zaterdag"),
        zondag: day("Zondag"),
        opmerking: fields.text({
          label: "Opmerking onder de openingstijden",
          description: "Bijv. 'Op feestdagen gelden de openingstijden van zondag.' Laat leeg voor geen opmerking. Tijdelijke wijzigingen (vakantie) kun je beter in de mededeling bovenaan zetten.",
          multiline: true,
        }),
      },
    }),
    // Announcement bar above the site, e.g. for holidays (client request, 2026-10-16).
    mededeling: singleton({
      label: "Mededeling bovenaan (bijv. vakantie)",
      path: "src/content/announcement",
      format: { data: "json" },
      schema: {
        active: fields.checkbox({ label: "Tonen op de website", defaultValue: false }),
        text: fields.text({ label: "Tekst", description: "Kort en duidelijk, bijv. 'Van 20 t/m 27 december zijn we gesloten.'", multiline: true }),
        linkLabel: fields.text({ label: "Linktekst (optioneel)", description: "Bijv. 'Meer informatie'." }),
        linkHref: fields.text({ label: "Link (optioneel)", description: "Een pad op de site, bijv. /contact, of een volledige URL." }),
      },
    }),
  },
  collections: {
    // Devices with their price lists (client request 2026-10-21), one file per device.
    toestellen: collection({
      label: "Toestellen en prijzen",
      path: "src/content/toestellen/*",
      format: { data: "json" },
      slugField: "name",
      schema: {
        name: fields.slug({
          name: { label: "Naam van het toestel", description: "Zoals hij op de site staat, bijv. iPhone 17 Pro of Galaxy S26.", validation: { isRequired: true } },
          slug: {
            label: "URL-naam",
            description: "Wordt de URL: /reparaties/<merk>/<url-naam>. Wordt automatisch ingevuld; niet meer wijzigen als het toestel online staat.",
            validation: {
              pattern: {
                regex: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                message: "Alleen kleine letters, cijfers en streepjes, bijv. oppo-reno-15-pro.",
              },
            },
          },
        }),
        brandId: fields.select({ label: "Merk", options: brandOptions, defaultValue: "apple" }),
        categoryId: fields.select({ label: "Soort toestel", options: categoryOptions, defaultValue: "smartphone" }),
        series: fields.text({
          label: "Serie",
          description: "Groepeert de modellen op de merkpagina, bijv. 'iPhone 17' of 'Galaxy S'. Leeg = de naam tot het eerste cijfer.",
        }),
        order: fields.integer({
          label: "Volgorde",
          description: "Lager getal = hoger in de lijst. Nieuwe modellen staan bovenaan met een laag getal, bijv. 100.",
          defaultValue: 100,
        }),
        releaseYear: fields.text({
          label: "Jaar van uitkomen (optioneel)",
          validation: { pattern: { regex: /^(20[1-3]\d)?$/, message: "Een jaartal, bijv. 2026, of leeg." } },
        }),
        art: fields.select({
          label: "Voorbeeldafbeelding",
          description: "Welke voorbeeldfoto of tekening bij dit toestel past.",
          options: [
            { label: "iPhone/telefoon met Dynamic Island (iPhone 14 Pro en nieuwer)", value: "phone-island" },
            { label: "iPhone met notch (iPhone X t/m 14)", value: "phone-notch" },
            { label: "Telefoon met thuisknop (iPhone 8, SE)", value: "phone-home-button" },
            { label: "Android-telefoon (camera in het scherm)", value: "phone-punch-hole" },
            { label: "Vouwtelefoon (Fold)", value: "phone-foldable" },
            { label: "Klaptelefoon (Flip)", value: "phone-flip" },
            { label: "Tablet", value: "tablet" },
            { label: "Tablet met thuisknop", value: "tablet-home-button" },
            { label: "MacBook / laptop", value: "laptop" },
            { label: "Spelcomputer", value: "console" },
          ],
          defaultValue: "phone-island",
        }),
        photo: fields.image({
          label: "Foto van dit model (optioneel)",
          description:
            "Een eigen foto (of een foto waarvoor je toestemming hebt), liefst op een witte of transparante achtergrond, ongeveer vierkant. Zonder foto staat er een voorbeeldfoto van het soort toestel.",
          directory: "public/images/toestellen",
          publicPath: "/images/toestellen/",
        }),
        popular: fields.checkbox({
          label: "Populair model",
          description: "Komt in aanmerking voor 'Veelgevraagde reparaties' op de homepage en de populaire modellen.",
          defaultValue: false,
        }),
        aliases: fields.array(fields.text({ label: "Naam" }), {
          label: "Andere namen en modelnummers (voor de zoekfunctie)",
          description: "Bijv. A3101 of 'Galaxy S26 5G'.",
          itemLabel: (p) => p.value || "(leeg)",
        }),
        prices: fields.array(
          fields.object({
            label: fields.text({
              label: "Omschrijving",
              description: "Zoals op de prijslijst, bijv. 'Scherm vervangen origineel Apple service pack'.",
              validation: { isRequired: true },
            }),
            price: fields.text({
              label: "Prijs",
              description: "Bijv. €130,- (hele euro's), 'op aanvraag' of 'verwacht'.",
              validation: { isRequired: true },
            }),
            repairId: fields.select({ label: "Reparatie", description: "Onder welke reparatie deze regel staat.", options: repairOptions, defaultValue: "auto" }),
            popular: fields.checkbox({ label: "Meest gekozen", description: "Toont het groene label 'Meest gekozen'.", defaultValue: false }),
            links: fields.array(
              fields.object({
                text: fields.text({ label: "Tekst uit de omschrijving", description: "Precies zoals in de omschrijving, bijv. 'origineel Apple service pack'." }),
                href: fields.text({ label: "Link", description: "Een pad op de site, bijv. /iphone-onderdelen-kalibreren." }),
              }),
              { label: "Links in de omschrijving (optioneel)", itemLabel: (p) => p.fields.text.value || "(nieuwe link)" },
            ),
          }),
          {
            label: "Prijzen",
            description: "Eén regel per reparatie of onderdeel, in de volgorde waarin ze op de site staan. Prijzen zijn inclusief montage en btw.",
            itemLabel: (p) => `${p.fields.label.value || "(nieuwe regel)"} — ${p.fields.price.value}`,
          },
        ),
        seo: fields.object(
          {
            title: fields.text({ label: "SEO-titel (optioneel)", description: "Leeg = '<naam> reparatie Den Bosch'.", validation: { length: { max: 70 } } }),
            description: fields.text({ label: "Meta-omschrijving (optioneel)", multiline: true, validation: { length: { max: 170 } } }),
          },
          { label: "SEO" },
        ),
        // Provenance from the import (original URLs, sources, price list source): kept, not shown.
        legacyUrls: fields.ignored(),
        sources: fields.ignored(),
        extra: fields.ignored(),
        priceSource: fields.ignored(),
      },
    }),
    // Blog posts (client request 2026-10-21): text with headings, lists, links and images.
    // Frequently asked questions (client request 2026-10-27): the FAQ page shows them all, the homepage
    // the first six, repair and device pages the ones linked to their repair plus the general ones.
    faq: collection({
      label: "Veelgestelde vragen",
      path: "src/content/faq/*",
      format: { data: "json" },
      slugField: "question",
      columns: ["question", "order"],
      schema: {
        question: fields.slug({
          name: { label: "Vraag", validation: { isRequired: true } },
          slug: {
            label: "Interne naam",
            description: "Wordt automatisch ingevuld; niet zichtbaar op de site.",
            validation: { pattern: { regex: /^[a-z0-9]+(?:-[a-z0-9]+)*$/, message: "Alleen kleine letters, cijfers en streepjes." } },
          },
        }),
        answer: fields.text({
          label: "Antwoord",
          description: "Een lege regel begint een nieuwe alinea.",
          multiline: true,
          validation: { isRequired: true },
        }),
        order: fields.integer({
          label: "Volgorde",
          description: "Lager getal = hoger in de lijst. De eerste zes staan ook op de homepage.",
          defaultValue: 500,
        }),
        repairIds: fields.multiselect({
          label: "Hoort bij reparatie",
          description: "Dan staat de vraag ook bij die reparatie en bij de toestellen. Leeg = algemene vraag (staat bij alle reparaties).",
          options: byOrder(repairsJson).map((r) => ({ label: r.name, value: r.id })),
        }),
        topics: fields.ignored(),
        sources: fields.ignored(),
      },
    }),
    blog: collection({
      label: "Blog",
      path: "src/content/blog/*",
      format: { contentField: "body" },
      slugField: "title",
      columns: ["title", "publishedAt"],
      entryLayout: "content",
      schema: {
        title: fields.slug({
          name: { label: "Titel", validation: { isRequired: true } },
          slug: { label: "URL-naam", description: "Wordt de URL: /blog-post/<url-naam>. Niet meer wijzigen als het bericht online staat." },
        }),
        publishedAt: fields.date({ label: "Publicatiedatum", defaultValue: { kind: "today" }, validation: { isRequired: true } }),
        excerpt: fields.text({
          label: "Korte samenvatting",
          description: "Eén of twee zinnen voor het blogoverzicht.",
          multiline: true,
          validation: { length: { max: 300 } },
        }),
        seo: fields.object(
          {
            title: fields.text({ label: "SEO-titel (optioneel)", validation: { length: { max: 70 } } }),
            description: fields.text({ label: "Meta-omschrijving (optioneel)", multiline: true, validation: { length: { max: 170 } } }),
          },
          { label: "SEO" },
        ),
        body: fields.markdoc({
          label: "Tekst",
          description: "Een YouTube-link op een eigen regel wordt een video.",
          options: {
            heading: [2, 3, 4],
            image: { directory: "public/images/blog", publicPath: "/images/blog/" },
            code: false,
            codeBlock: false,
            table: false,
          },
        }),
        updatedAt: fields.ignored(),
        summary: fields.ignored(),
        legacyUrls: fields.ignored(),
        sources: fields.ignored(),
        extra: fields.ignored(),
      },
    }),
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
            prices: fields.array(
              fields.object({
                label: fields.text({ label: "Omschrijving" }),
                price: fields.text({ label: "Prijs", description: "Zoals je hem wilt tonen, bijv. €15,-" }),
                note: fields.text({ label: "Toelichting (optioneel)", multiline: true }),
              }),
              { label: "Tarieven", itemLabel: (p) => `${p.fields.label.value} — ${p.fields.price.value}` },
            ),
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
