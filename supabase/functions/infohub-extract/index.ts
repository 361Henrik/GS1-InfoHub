import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')!;

const TOKEN_MAP: Record<string, number> = { kort: 2000, standard: 4000, dyp: 6000 };

const PROFILE_DESCRIPTIONS: Record<string, string> = {
  key_facts: 'Nøkkelfakta og hovedpoenger: De 5–10 viktigste poengene, definisjoner, tall/krav',
  claims_basis: 'Fakta- og påstandsgrunnlag: Konkrete påstander med kildehenvisning, hva som bør faglig kvalitetssikres (KS)',
  use_cases: 'Brukstilfeller og medlemsverdi: Problemet som løses, hvem får verdi, effekter, GS1s rolle',
  narrative: 'Historie og budskapslinje: Rød tråd, hoved- og støttebudskap, formuleringer/analogier',
  examples: 'Eksempler og illustrasjoner: 3–5 konkrete eksempler, case, scenarioer, sitater',
  risks: 'Risiko og forbehold: Sensitive påstander, usikkerheter, hva bør KS',
};

interface BriefContext {
  topic: string;
  audience: string;
  channels: string[];
  output_type: string | null;
  desired_effect: string | null;
  scope_limits: string | null;
}

function buildPrompt(
  briefContext: BriefContext,
  profiles: string[],
  customPoints: string[],
  outputFormat: string,
  sourceText: string,
): string {
  const profileLines = [
    ...profiles.map(p => `- ${PROFILE_DESCRIPTIONS[p] ?? p}`),
    ...customPoints.filter(Boolean).map(p => `- Egendefinert: ${p}`),
  ].join('\n');

  const formatNote = outputFormat === 'kort'
    ? 'Kort format: prioriter de viktigste poengene, hold deg til 1-sides ekvivalent.'
    : outputFormat === 'dyp'
    ? 'Dyp format: gi detaljerte svar med rike kildehenvisninger og utfyllende eksempler.'
    : 'Standard format: balanserte, strukturerte innsiktsdokumenter.';

  return `Du analyserer en kildetekst og trekker ut strukturert innsikt for GS1 Norway.

BRIEF-KONTEKST:
- Tema: ${briefContext.topic}
- Målgruppe: ${briefContext.audience}
${briefContext.output_type ? `- Output-type: ${briefContext.output_type}` : ''}
${briefContext.desired_effect ? `- Ønsket effekt: ${briefContext.desired_effect}` : ''}
${briefContext.scope_limits ? `- IKKE trekk ut: ${briefContext.scope_limits}` : ''}

UTTAKSPROFILER:
${profileLines}

FORMAT: ${formatNote}

KILDETEKST:
${sourceText.slice(0, 80_000)}

Returner KUN valid JSON i dette eksakte formatet — ingen tekst utenfor JSON-strukturen:
{
  "summary": ["punkt 1", "punkt 2"],
  "key_facts": [{"fact": "...", "source_ref": "..."}],
  "use_cases": [{"case": "...", "value": "...", "source_ref": "..."}],
  "narrative": {"red_thread": "...", "main_message": "...", "support_messages": ["..."]},
  "examples": [{"example": "...", "relevance": "...", "source_ref": "..."}],
  "risks": [{"risk": "...", "reason": "...", "ks_required": true}],
  "safe_phrases": ["..."],
  "source_references": {"seksjonsname": "kildehenvisning"}
}`;
}

async function callClaude(systemPrompt: string, userPrompt: string, maxTokens: number): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Anthropic API error ${response.status}: ${err}`);
  }

  const data = await response.json() as { content: { type: string; text: string }[] };
  return data.content.find(b => b.type === 'text')?.text ?? '';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*' } });
  }

  let insightDocumentId: string | undefined;

  try {
    const body = await req.json() as {
      insight_document_id: string;
      source_text: string;
      brief_context: BriefContext;
      profiles: string[];
      custom_points: string[];
      output_format: string;
    };

    insightDocumentId = body.insight_document_id;
    const { source_text, brief_context, profiles, custom_points, output_format } = body;

    if (!insightDocumentId || !source_text) {
      return new Response(JSON.stringify({ error: 'insight_document_id and source_text required' }), { status: 400 });
    }

    await supabase
      .schema('infohub')
      .from('insight_documents')
      .update({ status: 'generating' })
      .eq('id', insightDocumentId);

    const system = `Du er InfoHub, et profesjonelt research-verktøy for GS1 Norway sitt kommunikasjonsteam.

Din oppgave er å analysere kildetekst og trekke ut strukturert innsikt basert på den godkjente briefen og uttaksprofilene som er valgt.

Du skriver IKKE ferdig innhold — du identifiserer og organiserer det som faktisk finnes i kilden, presentert på en måte kommunikasjonsmedarbeidere kan bruke direkte.

Viktige regler:
- Trekk BARE ut informasjon som faktisk finnes i kildeteksten
- Merk påstander som trenger faglig kvalitetssikring med ks_required: true i risks-arrayen
- Bruk enkelt, klart norsk — unngå teknisk sjargong med mindre kilden krever det
- Alle fakta og påstander skal referere til hvilken del av kilden de kommer fra
- Returner alltid valid JSON i eksakt format som spesifisert — ingen kommentarer eller forklaringer utenfor JSON-strukturen`;

    const userPrompt = buildPrompt(brief_context, profiles, custom_points, output_format, source_text);
    const maxTokens = TOKEN_MAP[output_format] ?? 4000;

    const rawJson = await callClaude(system, userPrompt, maxTokens);

    const jsonMatch = rawJson.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in Claude response');
    const content = JSON.parse(jsonMatch[0]);

    await supabase
      .schema('infohub')
      .from('insight_documents')
      .update({ content, status: 'done' })
      .eq('id', insightDocumentId);

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('infohub-extract error:', msg);
    if (insightDocumentId) {
      await supabase.schema('infohub').from('insight_documents').update({ status: 'error' }).eq('id', insightDocumentId);
    }
    return new Response(JSON.stringify({ error: msg }), { status: 500 });
  }
});
