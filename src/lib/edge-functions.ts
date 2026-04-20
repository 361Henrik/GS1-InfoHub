// DEMO MODE — all edge function calls are simulated locally with realistic delays.
// Real API calls (Claude + Supabase) are never made.
import { mockSupabase } from './demo-store';
import type { BriefContext, OutputFormat, InsightContent, SummaryContent, FoundationContent } from './types';

const db = mockSupabase._mutate;

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function fetchUrl(sourceId: string, _url: string): Promise<void> {
  await delay(1800);
  db.updateSource(sourceId, { status: 'done', extracted_text: '[Demo] Kildetekst hentet og klargjort.' });
}

export async function parsePdf(sourceId: string, _pdfPath: string): Promise<void> {
  await delay(2400);
  db.updateSource(sourceId, { status: 'done', extracted_text: '[Demo] PDF parset og klargjort.' });
}

export async function extractInsight(
  insightDocumentId: string,
  _sourceText: string,
  briefContext: BriefContext,
  profiles: string[],
  customPoints: string[],
  _outputFormat: OutputFormat,
): Promise<void> {
  db.updateInsightDoc(insightDocumentId, { status: 'generating' });
  await delay(3500);

  const mockContent: InsightContent = {
    summary: [
      `Kilden gir solid dekning av temaet "${briefContext.topic}" fra perspektivet til ${briefContext.audience ?? 'målgruppen'}.`,
      'Nøkkelfunnene peker mot tre konkrete handlingsmuligheter kommunikasjonsteamet kan bygge videre på.',
      'Materialet inneholder flere sitérbare påstander med god kildeforankring.',
      ...(profiles.includes('risks') ? ['Noen påstander krever faglig kvalitetssikring før publisering.'] : []),
    ],
    key_facts: [
      { fact: 'Standarden er ISO-sertifisert og bakoverkompatibel med eksisterende GS1-infrastruktur', source_ref: 'Avsnitt 2' },
      { fact: 'Norsk implementeringstid estimeres til 2–6 uker for eksisterende GS1-medlemmer', source_ref: 'Avsnitt 4' },
      { fact: 'Over 40 norske virksomheter har startet implementering per Q1 2026', source_ref: 'Avsnitt 6' },
    ],
    use_cases: [
      { case: 'Forbruker scanner produkt og får full informasjon tilpasset kontekst', value: 'Økt forbrukertillit og konvertering', source_ref: 'Avsnitt 3.1' },
      { case: 'Logistikkoperatør automatiserer varemottak via direkte systemintegrasjon', value: 'Redusert feilrate og manuell innsats', source_ref: 'Avsnitt 3.3' },
    ],
    narrative: {
      red_thread: `${briefContext.topic} handler i bunn og grunn om én ting: å gjøre kompleks informasjon tilgjengelig for rett person til rett tid.`,
      main_message: `GS1-standarden gir norsk handel en delt infrastruktur som alle kan bygge på.`,
      support_messages: [
        'Investering i GS1-infrastruktur er en investering i hele bransjens digitale ryggrad.',
        'Norsk handel er allerede i bevegelse — nå gjelder det å henge med.',
      ],
    },
    examples: [
      { example: 'Norsk dagligvarekjede implementerte standarden på tre uker med hjelp fra GS1 Norway', relevance: 'Viser rask implementering er mulig i norsk kontekst', source_ref: 'Avsnitt 5.2' },
      { example: 'Produsent innen fiskeri brukte standarden for sporbarhet fra kai til Tokyo supermarked', relevance: 'Internasjonal relevans for norsk eksportindustri', source_ref: 'Avsnitt 5.4' },
    ],
    risks: [
      { risk: 'Adopsjonsstall bør verifiseres mot GS1 Norways offisielle oppdaterte tall', reason: 'Tall i kilden kan være utdaterte eller kontekstuelt begrenset', ks_required: true },
    ],
    safe_phrases: [
      ...(customPoints.filter(Boolean).map(p => `[Demo — egendefinert punkt: ${p}]`)),
      'GS1 Norway er din partner for en smidig implementering.',
      'Med GS1 Digital Link gjør du én investering som løser tre utfordringer samtidig.',
    ],
    source_references: {
      'Nøkkelfakta': 'Avsnitt 2–4: Standardspesifikasjon og norsk kontekst',
      'Brukstilfeller': 'Avsnitt 3: Implementeringsguide',
    },
  };

  db.updateInsightDoc(insightDocumentId, { content: mockContent, status: 'done' });
}

export async function summarizeInsights(runId: string): Promise<void> {
  await delay(4000);

  const run = db.getRunById(runId);
  const docs = db.getInsightDocsForRun(runId);
  const sources = db.getSourcesForRun(runId);

  const mockSummary: SummaryContent = {
    top_findings: [
      `Samtlige ${docs.length} kilder bekrefter potensialet i tema ${run?.title ?? 'dette temaet'} for norsk handel.`,
      'Det finnes sterk og variert evidens for forretningsverdi — fordelt på forbruker-, logistikk- og regulatorisk perspektiv.',
      'Norsk adopsjon er i gang med flere dokumenterte pilotprosjekter som gir sitérbare referanser.',
      'Kommunikasjonsteamet har solid grunnlag for å hevde at standarden er "norsk handels neste naturlige steg".',
      `${sources.length} kilder med komplementært innhold gir bred dekning av temaet fra ulike vinkler.`,
    ],
    red_thread: [
      'Fra infrastruktur til verdi — GS1 gjør norsk handels digitale ryggrad synlig og tilgjengelig.',
      'Én standard. Uendelige muligheter. GS1 Norway tar deg dit.',
    ],
    key_facts: docs.flatMap(d => (d.content?.key_facts ?? []).slice(0, 2).map(f => ({
      fact: f.fact,
      source: sources.find(s => s.id === d.source_id)?.title ?? 'Ukjent kilde',
    }))),
    use_cases: [
      { case: 'Forbrukerkommunikasjon via QR — allergen, næringsinnhold, bærekraft', value: 'Bygger tillit og øker kjøpsintensjon' },
      { case: 'Logistikkautomatisering — fra manuell skanning til systemintegrasjon', value: 'Reduserer feilrate og kostnader' },
      { case: 'Sporbarhet og produkttilbaketrekning — sekund-presis identifikasjon', value: 'Dramatisk redusert risiko' },
    ],
    examples: docs.flatMap(d => (d.content?.examples ?? []).slice(0, 1).map(e => ({
      example: e.example,
      source: sources.find(s => s.id === d.source_id)?.title ?? 'Ukjent kilde',
    }))),
    quality_checks: [
      'Verifiser alle adopsjonsstall mot GS1 Norways løpende statistikk før publisering.',
      'Kostnadstall er globale estimater — innhent norske referansetall fra GS1 Norway implementeringsteam.',
      'Pilotresultater bør merkes tydelig som slike — organisk utrulling gir typisk lavere effekt.',
    ],
    sources: sources.map((s, i) => `Kilde ${i + 1}: ${s.title ?? s.url ?? s.pdf_path ?? 'Ukjent'}`),
  };

  db.upsertSummary({
    id: `sum-${runId}`,
    created_at: new Date().toISOString(),
    run_id: runId,
    content: mockSummary,
    status: 'done',
  });
}

export async function buildFoundation(runId: string): Promise<void> {
  await delay(5000);

  const run = db.getRunById(runId);
  const summary = db.getSummaryForRun(runId);
  const sources = db.getSourcesForRun(runId);

  const mockFoundation: FoundationContent = {
    purpose_audience: `Dette grunnlagsdokumentet støtter ${run?.title ?? 'kommunikasjonskampanjen'}. Formålet er å gi ${run?.audience_level ?? 'kommunikasjonsteamet'} et kildeforankret fundament for videre innholdsproduksjon — artikler, webinarer, LinkedIn-poster eller intern orientering.`,
    key_facts: (summary?.content?.key_facts ?? []).slice(0, 5).map(f => ({
      fact: f.fact,
      source: f.source,
    })),
    use_cases: (summary?.content?.use_cases ?? []).map(u => ({
      case: u.case,
      value: u.value,
      gs1_role: 'GS1 Norway leverer standard, resolver og implementeringsstøtte',
    })),
    narrative: {
      red_thread: summary?.content?.red_thread?.[0] ?? `${run?.title ?? 'Temaet'} handler om å gjøre norsk handel mer effektiv, transparent og konkurransedyktig.`,
      recommended_angle: `Posisjoner GS1 som den usynlige infrastrukturen som gjør ${run?.output_type ?? 'dette innholdet'} mulig — allerede på plass, klar til bruk.`,
      support_points: summary?.content?.red_thread?.slice(1) ?? [
        'GS1-standarder er grunnlaget for moderne handelssystemer globalt.',
        'Norsk handel er i bevegelse — GS1 Norway er med der det skjer.',
      ],
    },
    examples: (summary?.content?.examples ?? []).map(e => ({
      example: e.example,
      shows: 'Praktisk verdi og norsk relevans',
      source: e.source,
    })),
    risks: [
      { statement: 'Adopsjonsstall og statistikk brukt i kommunikasjon', concern: 'Bør verifiseres mot GS1 Norways oppdaterte data', ks_required: true },
      { statement: 'Kostnadspåstander fra globale implementeringsveiledninger', concern: 'Norske tall bør innhentes separat', ks_required: true },
    ],
    glossary: [
      { term: 'GTIN', definition: 'Global Trade Item Number — den globale produktidentifikatoren i GS1-systemet' },
      { term: 'Resolver', definition: 'Nettjeneste som kobler GS1-identifikatorer til riktig informasjonskilde' },
      { term: 'Validoo', definition: 'GS1 Norways produktdataportal' },
    ],
    sources: sources.map(s => ({
      title: s.title ?? 'Ukjent kilde',
      url_or_name: s.url ?? s.pdf_path ?? '',
    })),
  };

  db.upsertFoundation({
    id: `fd-${runId}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    run_id: runId,
    content: mockFoundation,
    user_notes: null,
    status: 'draft',
  });
}
