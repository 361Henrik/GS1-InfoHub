import type {
  Brief, Run, Source, InsightDocument, InsightSummary, FoundationDocument,
  InsightContent, SummaryContent, FoundationContent,
} from './types';

// ---- Briefs (from DynamiskBrief) ----------------------------

export const DEMO_BRIEFS: Brief[] = [
  {
    id: 'brief-1',
    created_at: '2026-04-10T09:00:00Z',
    topic: 'GS1 Digital Link — kommunikasjon av ny standard til norske handelsledder',
    audience: 'Logistikkledere og innkjøpssjefer i norsk dagligvare og faghandel',
    channels: ['LinkedIn', 'Nyhetsbrev', 'Webinar'],
    generated_brief: null,
    status: 'approved',
  },
  {
    id: 'brief-2',
    created_at: '2026-04-07T14:30:00Z',
    topic: 'Bærekraft og produktdata — GS1s rolle i ESG-rapportering',
    audience: 'Bærekraftansvarlige og CFOer i norske produksjonsbedrifter',
    channels: ['Artikkel', 'LinkedIn'],
    generated_brief: null,
    status: 'approved',
  },
];

// ---- Sources ------------------------------------------------

export const DEMO_SOURCES: Source[] = [
  {
    id: 'src-1a',
    created_at: '2026-04-11T08:00:00Z',
    run_id: 'run-1',
    type: 'url',
    url: 'https://www.gs1.org/standards/gs1-digital-link',
    pdf_path: null,
    title: 'GS1 Digital Link Standard — gs1.org',
    status: 'done',
    extracted_text: null,
  },
  {
    id: 'src-1b',
    created_at: '2026-04-11T08:05:00Z',
    run_id: 'run-1',
    type: 'url',
    url: 'https://www.gs1.org/docs/digital-link/GS1_Digital_Link_Standard_i1.pdf',
    pdf_path: null,
    title: 'GS1 Digital Link — implementeringsveiledning',
    status: 'done',
    extracted_text: null,
  },
  {
    id: 'src-1c',
    created_at: '2026-04-11T08:10:00Z',
    run_id: 'run-1',
    type: 'pdf',
    url: null,
    pdf_path: 'run-1/gs1-digital-link-case-studie-coop.pdf',
    title: 'Case: Coop — Digital Link pilotprosjekt 2025',
    status: 'done',
    extracted_text: null,
  },
  {
    id: 'src-2a',
    created_at: '2026-04-14T10:00:00Z',
    run_id: 'run-2',
    type: 'url',
    url: 'https://www.gs1.org/standards/gs1-esg-data',
    pdf_path: null,
    title: 'GS1 og bærekraftdata — oversikt',
    status: 'done',
    extracted_text: null,
  },
];

// ---- Insight document content (realistic GS1 material) ------

const insightContent1a: InsightContent = {
  summary: [
    'GS1 Digital Link er en ny ISO-standard (ISO/IEC 18975) som gjør QR-koder til universelle portaler for produktinformasjon.',
    'Standarden lar én QR-kode erstatte alle eksisterende strekkodeformater og gi rik, kontekstsensitiv produktdata til alle ledd i verdikjeden.',
    'Implementering krever GS1-prefiks, GTIN-registrering og en GS1-sertifisert resolver — alle tre er allerede tilgjengelig for GS1 Norway-medlemmer.',
    'Norske dagligvarekjeder som Coop og NorgesGruppen har startet pilotprosjekter — full utrulling er ventet innen Q3 2027.',
    'For kommunikasjonsteamet er nøkkelbudskapet: Digital Link er ikke en teknisk oppgradering, det er et fundamentalt skifte i hva en strekkode er.',
  ],
  key_facts: [
    { fact: 'GS1 Digital Link bygger på vanlige web-URIer og er kompatibel med eksisterende infrastruktur', source_ref: 'Avsnitt 2.1' },
    { fact: 'En Digital Link QR-kode kan inneholde GTIN, serienummer, holdbarhetsdato og mye mer i én skanning', source_ref: 'Avsnitt 3.4' },
    { fact: 'ISO/IEC 18975:2022 er den offisielle standarden — GS1 er sekretariatsansvarlig', source_ref: 'Innledning' },
    { fact: 'Scanningsdata kan brukes til sporbarhet, antisvindel, forbrukerinformasjon og logistikkoptimalisering', source_ref: 'Avsnitt 5.2' },
    { fact: 'Eksisterende EAN-13 og GS1-128 koder forblir gyldige — Digital Link er et tillegg, ikke en erstatning', source_ref: 'Avsnitt 2.3' },
  ],
  use_cases: [
    { case: 'Forbruker scanner QR på produkt og får næringsinnhold, allergeninformasjon og oppskriftsforslag', value: 'Økt forbrukertillit og engasjement', source_ref: 'Avsnitt 4.1' },
    { case: 'Grossist scanner pall i varemottak og får automatisk oppdatert lagerstatus med serienummer og holdbarhet', value: 'Redusert manuell registrering, færre feil', source_ref: 'Avsnitt 4.3' },
    { case: 'Produsent bruker Digital Link for tilbakekalling — alle berørte produkter identifiseres og spores på sekunder', value: 'Kraftig redusert risiko ved produkttilbaketrekning', source_ref: 'Avsnitt 4.5' },
  ],
  narrative: {
    red_thread: 'En strekkode har i 50 år vært et tall. Med GS1 Digital Link blir den en levende portal — et bindeledd mellom det fysiske produktet og all informasjon om det, for alle aktører, i sanntid.',
    main_message: 'GS1 Digital Link er norsk handels digitale infrastruktur for de neste 30 årene.',
    support_messages: [
      'Alle eksisterende GS1-investeringer gjenbrukes — dette er en oppgradering, ikke en omstart.',
      'Forbrukeren ser en QR. Bak den ligger hele produktets livssyklus.',
      'GS1 Norway gir deg standard, resolver og veiledning — teknologien er allerede her.',
    ],
  },
  examples: [
    { example: 'Coop Norge testet Digital Link på 200 ferdigmatprodukter i Q4 2025. Resultat: 34% økning i forbrukerinteraksjon via produktsider.', relevance: 'Konkret norsk case med målbare tall', source_ref: 'Avsnitt 6.1' },
    { example: 'Orkla implementerte Digital Link for sporbarhet av laksefilet fra norsk oppdrettsanlegg til japansk supermarked.', relevance: 'Viser global relevans for norsk eksport', source_ref: 'Avsnitt 6.3' },
    { example: 'Meny bruker Digital Link for holdbarhetsvarsling — ansatte scanner med mobiltelefon og får varsel om nær-utløpte varer automatisk.', relevance: 'Intern operasjonell verdi i dagligvare', source_ref: 'Avsnitt 6.5' },
  ],
  risks: [
    { risk: 'Påstand om at "alle norske kjeder har startet utrulling" — kun pilotprosjekter er bekreftet', reason: 'Overdrivelse av adopsjonsstatus kan skade troverdigheten', ks_required: true },
    { risk: 'Tekniske detaljer om resolver-arkitektur kan missforståes som krav til IT-bytte', reason: 'Kommunikasjonsteamet bør unngå å skremme bort ikke-tekniske beslutningstakere', ks_required: false },
  ],
  safe_phrases: [
    'GS1 Digital Link gjør QR-koden til en levende portal for produktinformasjon.',
    'Fra tall til fortelling — en strekkode som forteller hele produktets historie.',
    'Én QR. Ubegrenset informasjon. For alle ledd i verdikjeden.',
    'GS1 Norway gir deg standarden, infrastrukturen og veiledningen.',
  ],
  source_references: {
    'Nøkkelfakta': 'Avsnitt 2–3: Teknisk spesifikasjon og kompatibilitet',
    'Brukstilfeller': 'Avsnitt 4–5: Implementeringsguide og use case-katalog',
    'Eksempler': 'Avsnitt 6: Case studies fra nordiske piloter',
  },
};

const insightContent1b: InsightContent = {
  summary: [
    'Implementeringsveiledningen dekker tre faser: Forberedelse (GTIN-oppfølging), Bygg (resolver-integrasjon) og Drift (dataforvaltning).',
    'Fase 1 tar typisk 2–4 uker for et gjennomsnittlig GS1-medlem med eksisterende GTIN-portefølje.',
    'GS1 Norway tilbyr en sandkasse-resolver for testing — dette er ikke nevnt i den globale standarden men er norsk spesifikk.',
    'Leverandørportalen Validoo er integrert med Digital Link-infrastrukturen fra Q1 2026.',
  ],
  key_facts: [
    { fact: 'Minimumskrav for fase 1: aktiv GS1-prefiks, minst én GTIN registrert i Validoo, tilgang til GS1 Norway resolver', source_ref: 'Fase 1, side 4' },
    { fact: 'GS1 Norway resolver-SLA: 99.9% oppetid, maks 200ms responstid globalt', source_ref: 'Vedlegg B' },
    { fact: 'Kostnadsestimat for teknisk implementering: 40–120 timer avhengig av ERP-integrasjon', source_ref: 'Appendix A' },
  ],
  use_cases: [
    { case: 'Merkevareansvarlig oppdaterer ingrediensliste i Validoo — endringen vises automatisk for forbrukere via QR innen 15 minutter', value: 'Eliminerer behov for ny emballasjetrykk ved mindre produktendringer', source_ref: 'Fase 3, side 12' },
  ],
  narrative: {
    red_thread: 'Implementering er enklere enn det ser ut — særlig for eksisterende GS1-medlemmer med Validoo-tilgang.',
    main_message: 'Digital Link er et naturlig neste steg for GS1-medlemmer, ikke en teknisk revolusjon.',
    support_messages: [
      'Du er sannsynligvis allerede 60% ferdig — du har GTINene, du har GS1-prefikset.',
      'GS1 Norway tar deg gjennom resten.',
    ],
  },
  examples: [
    { example: 'Tine SA fullførte fase 1 på 11 dager med hjelp fra GS1 Norway implementeringsteam.', relevance: 'Referanse til kjent norsk merkevare, kort tidshorisont', source_ref: 'Fase 1 case, side 7' },
  ],
  risks: [
    { risk: 'Kostnadsestimater er globale tall og reflekterer ikke norske timelønnskostnader', reason: 'Bør ikke siteres direkte — norske IT-timekostnader er vesentlig høyere', ks_required: true },
  ],
  safe_phrases: [
    'Som GS1-medlem er du allerede halvveis. Vi tar deg gjennom resten.',
    'Fra standard til praksis — på uker, ikke år.',
  ],
  source_references: {
    'Implementeringsfaser': 'Side 4–18: Faseinndeling og sjekklister',
    'Kostnader': 'Appendix A: Global benchmarkdata',
  },
};

const insightContent1c: InsightContent = {
  summary: [
    'Coop Norge gjennomførte et 6-måneders pilotprosjekt med Digital Link på 200 ferdigmatprodukter i kjedens egne merkevarer.',
    'Prosjektet viste 34% økning i forbrukerinteraksjon og 22% reduksjon i kundeservicesaker relatert til ingrediensspørsmål.',
    'Pilotkostnaden var lavere enn forventet — eksisterende Validoo-integrasjon dekket 80% av teknisk arbeid.',
    'Coop anbefaler andre kjeder å starte med egne merkevarer (EMV) som er enklere å kontrollere end-to-end.',
  ],
  key_facts: [
    { fact: '200 produkter ble Digital Link-aktivert over 3 uker', source_ref: 'Prosjektoversikt, s. 2' },
    { fact: '34% økning i QR-skanninger sammenlignet med tradisjonell QR-kampanje', source_ref: 'Resultater, s. 8' },
    { fact: 'Gjennomsnittlig besøkstid på produktsider via Digital Link: 2 min 40 sek', source_ref: 'Resultater, s. 9' },
    { fact: 'Pilotkostnad: under 500 000 NOK inkludert ekstern konsulentbistand', source_ref: 'Økonomi, s. 14' },
  ],
  use_cases: [
    { case: 'Coop-kunden scanner matpakken og ser at produktet matcher barnets nøtteallergi — og får anbefalt alternativt produkt', value: 'Konkret nytteverdi for allergiutsatte forbrukere — høy emosjonell relevans', source_ref: 'Brukeropplevelse, s. 6' },
    { case: 'Varepåfyller på Coop Extra bekrefter holdbarhetsdato ved skanning — ingen manuell kontroll nødvendig', value: 'Operasjonell effektivitet i butikk', source_ref: 'Internt case, s. 11' },
  ],
  narrative: {
    red_thread: 'Coop-casen beviser at Digital Link ikke er teori — det er et produkt norsk handel kan ta i bruk nå, med synlige resultater på måneder.',
    main_message: 'Digital Link gir verdi for forbrukeren, effektivitet for butikken og data for merkevarebyggeren.',
    support_messages: [
      'Coop begynte med 200 produkter og egne merkevarer. Det er riktig sted å starte.',
      'Pilotkostnaden er under ett salgsstillingsoppslag — avkastningen er synlig innen 3 måneder.',
    ],
  },
  examples: [
    { example: 'Coop Smør fikk 41% økning i QR-interaksjon etter Digital Link-aktivering — uten ny emballasje, kun resolver-oppdatering', relevance: 'Konkret produkt, konkret tall, minimal investering', source_ref: 'Produktcases, s. 10' },
  ],
  risks: [
    { risk: 'Coop-tallene er fra en kontrollert pilot — organisk utrulling i full skala kan gi andre resultater', reason: 'Piloter overestimerer ofte effekt pga. ekstra fokus og ressurser', ks_required: true },
  ],
  safe_phrases: [
    'Coop viste at Digital Link kan aktiveres på under en måned — og gir målbare resultater.',
    'Det norske markedet er klart. Teknologien er klar. GS1 Norway er klar.',
  ],
  source_references: {
    'Pilotresultater': 'Side 8–12: Kvantitative KPIer og brukerdata',
    'Økonomi': 'Side 14: Kostnad og ROI-estimat',
  },
};

export const DEMO_INSIGHT_DOCS: InsightDocument[] = [
  { id: 'doc-1a', created_at: '2026-04-11T09:00:00Z', run_id: 'run-1', source_id: 'src-1a', content: insightContent1a, status: 'done' },
  { id: 'doc-1b', created_at: '2026-04-11T09:05:00Z', run_id: 'run-1', source_id: 'src-1b', content: insightContent1b, status: 'done' },
  { id: 'doc-1c', created_at: '2026-04-11T09:10:00Z', run_id: 'run-1', source_id: 'src-1c', content: insightContent1c, status: 'done' },
];

// ---- Insight summary ----------------------------------------

const summaryContent1: SummaryContent = {
  top_findings: [
    'GS1 Digital Link transformerer QR-koden fra et statisk tall til en dynamisk portal for all produktinformasjon.',
    'Norske kjeder er i bevegelse — Coop-piloten beviser at teknologien fungerer i norsk kontekst med målbare resultater.',
    'Implementeringskostnaden er lavere enn markedet tror — eksisterende GS1-infrastruktur dekker 60–80% av teknisk grunnlag.',
    'Standarden løser tre simultane behov: forbrukerkommunikasjon, operasjonell effektivitet og regulatorisk sporbarhet.',
    'GS1 Norway er unikt posisjonert som den eneste aktøren som kan tilby standard + infrastruktur + veiledning i ett.',
  ],
  red_thread: [
    'Den gamle strekkoden er et nummer. Den nye er en portal. GS1 gjør overgangen enkel.',
    'Fra fysisk produkt til digital opplevelse — GS1 Digital Link er broen.',
  ],
  key_facts: [
    { fact: 'ISO/IEC 18975:2022 — GS1 er ansvarlig for standarden', source: 'Kilde 1' },
    { fact: 'Coop-pilot: 34% økning i QR-interaksjon, 22% færre ingrediensspørsmål til kundeservice', source: 'Kilde 3' },
    { fact: 'Pilotkostnad under 500 000 NOK for 200 produkter', source: 'Kilde 3' },
    { fact: 'GS1 Norway resolver: 99.9% oppetid, 200ms responstid', source: 'Kilde 2' },
  ],
  use_cases: [
    { case: 'Forbruker-portal: allergeninformasjon, oppskrifter, bærekraftdata via QR', value: 'Økt tillit og kjøpsintensjon' },
    { case: 'Logistikk-integrasjon: automatisk lagerstatus ved mottak', value: 'Redusert manuell registrering' },
    { case: 'Produkttilbaketrekning: sekund-presis identifikasjon av berørte varer', value: 'Dramatisk redusert risiko' },
  ],
  examples: [
    { example: 'Coop Smør: 41% økning i QR-interaksjon uten ny emballasje', source: 'Kilde 3' },
    { example: 'Tine SA fullførte fase 1 implementering på 11 dager', source: 'Kilde 2' },
    { example: 'Orkla: sporbarhet fra norsk lakseoppdrett til japansk supermarked', source: 'Kilde 1' },
  ],
  quality_checks: [
    'Adopsjonsstatus blant norske kjeder: bekreft at kun pilotprosjekter er dokumentert, ikke full utrulling.',
    'Kostnadsestimater fra implementeringsveiledningen er globale — norske tall bør innhentes fra GS1 Norway.',
    'Coop-tallene er fra kontrollert pilot — angi dette tydelig dersom de brukes i ekstern kommunikasjon.',
  ],
  sources: [
    'Kilde 1: GS1 Digital Link Standard — gs1.org',
    'Kilde 2: GS1 Digital Link implementeringsveiledning',
    'Kilde 3: Coop case study — Digital Link pilot 2025',
  ],
};

export const DEMO_SUMMARIES: InsightSummary[] = [
  { id: 'sum-1', created_at: '2026-04-11T09:30:00Z', run_id: 'run-1', content: summaryContent1, status: 'done' },
];

// ---- Foundation document ------------------------------------

const foundationContent1: FoundationContent = {
  purpose_audience: 'Dette grunnlagsdokumentet støtter kommunikasjonskampanjen om GS1 Digital Link rettet mot logistikkledere og innkjøpssjefer i norsk dagligvare og faghandel. Formålet er å gi disse beslutningstakerne forståelse for hva standarden er, hvorfor den er relevant for dem nå, og hvilken rolle GS1 Norway spiller i implementeringen.',
  key_facts: [
    { fact: 'GS1 Digital Link er en ISO-standard (ISO/IEC 18975:2022) som gjør QR-koder til dynamiske produktportaler', source: 'gs1.org' },
    { fact: 'Standarden er bakoverkompatibel med EAN-13 og GS1-128 — eksisterende strekkoder utgår ikke', source: 'Implementeringsveiledning' },
    { fact: 'Coop Norge oppnådde 34% økning i forbrukerinteraksjon i pilotprosjekt med 200 produkter', source: 'Coop case study 2025' },
    { fact: 'Pilotkostnaden var under 500 000 NOK — eksisterende GS1-infrastruktur dekket mesteparten', source: 'Coop case study 2025' },
    { fact: 'GS1 Norway resolver tilbyr 99.9% oppetid og under 200ms responstid globalt', source: 'Implementeringsveiledning' },
  ],
  use_cases: [
    { case: 'Forbruker scanner QR og får allergeninformasjon, næringsinnhold og oppskriftsforslag', value: 'Økt forbrukertillit og kjøpsintensjon', gs1_role: 'Tilbyr resolver og standardformat for produktdata' },
    { case: 'Logistikkoperatør scanner pall ved mottak — automatisk lagerstatus og holdbarhetskontroll', value: 'Redusert manuell registrering og feilrate', gs1_role: 'Leverer unik identifikasjon via GTIN + serienummer i Digital Link URI' },
    { case: 'Merkevareansvarlig oppdaterer produktinformasjon i Validoo — endring synlig for forbrukere via QR innen 15 min', value: 'Eliminerer emballasjetrykk ved produktjusteringer', gs1_role: 'Validoo er allerede GS1-integrert og Digital Link-klar' },
  ],
  narrative: {
    red_thread: 'En strekkode har i 50 år vært et tall. Med GS1 Digital Link blir den en levende portal — et bindeledd mellom det fysiske produktet og all informasjon om det, for alle aktører, i sanntid.',
    recommended_angle: 'Posisjoner GS1 Digital Link som "infrastrukturen norsk handel allerede betaler for, nå fullt aktivert". Unngå å fokusere på teknologi — fokuser på forretningsverdi og at de allerede er nesten der.',
    support_points: [
      'Du er allerede GS1-medlem. Du har GTINene. Du har Validoo. Neste steg er kortere enn du tror.',
      'Forbrukeren ser en QR. Det er portalen til alt du vet om produktet ditt.',
      'Coop og Tine er allerede i gang. Norsk handel beveger seg.',
    ],
  },
  examples: [
    { example: 'Coop Smør: 41% økning i QR-interaksjon etter Digital Link-aktivering — uten ny emballasje', shows: 'Høy ROI med minimal investering', source: 'Coop case study 2025' },
    { example: 'Tine SA fullførte implementeringsfase 1 på 11 dager med GS1 Norway-støtte', shows: 'Rask implementering er mulig for store norske merkevarer', source: 'Implementeringsveiledning' },
    { example: 'Orkla: sporbarhet fra norsk lakseoppdrett til japansk supermarked via Digital Link', shows: 'Global relevans for norsk eksport', source: 'gs1.org' },
  ],
  risks: [
    { statement: '"Alle norske kjeder har startet utrulling av Digital Link"', concern: 'Kun pilotprosjekter er dokumentert — full utrulling er ikke bekreftet', ks_required: true },
    { statement: 'Kostnadsestimater fra implementeringsveiledningen', concern: 'Globale tall — norske IT-timekostnader er vesentlig høyere. Innhent norske tall fra GS1 Norway', ks_required: true },
    { statement: 'Coop-pilottall brukt som generelle bransjestandarder', concern: 'Piloteffekter overvurderes ofte — angi alltid at dette er fra et kontrollert pilotprosjekt', ks_required: false },
  ],
  glossary: [
    { term: 'GS1 Digital Link', definition: 'ISO-standard for QR-koder som lenker til produktinformasjon via en web-URI med GS1-identifikatorer' },
    { term: 'GTIN', definition: 'Global Trade Item Number — den globale produktidentifikatoren som brukes i alle GS1-standarder' },
    { term: 'Resolver', definition: 'En nettjeneste som tar imot en GS1 Digital Link URI og videresender til riktig informasjonskilde basert på kontekst' },
    { term: 'Validoo', definition: 'GS1 Norways produktdataportal der leverandører vedlikeholder produktinformasjon for hele verdikjeden' },
    { term: 'EMV', definition: 'Egne merkevarer — produkter solgt under kjedens eget merkenavn, f.eks. Coop-merket' },
  ],
  sources: [
    { title: 'GS1 Digital Link Standard', url_or_name: 'https://www.gs1.org/standards/gs1-digital-link' },
    { title: 'GS1 Digital Link implementeringsveiledning', url_or_name: 'gs1.org/docs/digital-link/...' },
    { title: 'Coop case study — Digital Link pilot 2025', url_or_name: 'Intern Coop-rapport (PDF)' },
  ],
};

export const DEMO_FOUNDATION_DOCS: FoundationDocument[] = [
  {
    id: 'fd-1',
    created_at: '2026-04-11T10:00:00Z',
    updated_at: '2026-04-11T10:00:00Z',
    run_id: 'run-1',
    content: foundationContent1,
    user_notes: '',
    status: 'draft',
  },
];

// ---- Runs ---------------------------------------------------

export const DEMO_RUNS: Run[] = [
  {
    id: 'run-1',
    created_at: '2026-04-11T08:00:00Z',
    updated_at: '2026-04-11T10:00:00Z',
    brief_id: 'brief-1',
    manual_brief: null,
    title: 'GS1 Digital Link — kommunikasjon 2026',
    status: 'completed',
    extraction_profiles: ['key_facts', 'use_cases', 'narrative', 'examples', 'risks'],
    custom_extraction_points: ['Finn tall og statistikk som kan brukes i LinkedIn-poster', 'Identifiser konkrete norske referanser og cases'],
    output_type: 'linkedin',
    desired_effect: 'handling',
    audience_level: 'Logistikkledere og innkjøpssjefer, ikke-teknisk bakgrunn',
    scope_limits: 'Unngå dyptgående teknisk arkitektur og resolver-implementeringsdetaljer',
    output_format: 'standard',
    tags: ['digital-link', 'standard', 'q2-2026'],
  },
  {
    id: 'run-2',
    created_at: '2026-04-14T09:00:00Z',
    updated_at: '2026-04-14T09:00:00Z',
    brief_id: 'brief-2',
    manual_brief: null,
    title: 'Bærekraft og produktdata — ESG 2026',
    status: 'draft',
    extraction_profiles: ['key_facts', 'use_cases'],
    custom_extraction_points: [],
    output_type: 'artikkel',
    desired_effect: 'forstaelse',
    audience_level: null,
    scope_limits: null,
    output_format: 'standard',
    tags: ['bærekraft', 'esg'],
  },
];
