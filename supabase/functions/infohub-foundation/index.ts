import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')!;

async function callClaude(system: string, user: string, maxTokens = 8000): Promise<string> {
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
      system,
      messages: [{ role: 'user', content: user }],
    }),
  });
  if (!response.ok) throw new Error(`Anthropic API error ${response.status}`);
  const data = await response.json() as { content: { type: string; text: string }[] };
  return data.content.find(b => b.type === 'text')?.text ?? '';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*' } });
  }

  try {
    const { run_id } = await req.json() as { run_id: string };
    if (!run_id) return new Response(JSON.stringify({ error: 'run_id required' }), { status: 400 });

    const [runRes, summaryRes, docsRes, sourcesRes] = await Promise.all([
      supabase.schema('infohub').from('runs').select('*').eq('id', run_id).single(),
      supabase.schema('infohub').from('insight_summaries').select('*').eq('run_id', run_id).maybeSingle(),
      supabase.schema('infohub').from('insight_documents').select('*').eq('run_id', run_id).eq('status', 'done'),
      supabase.schema('infohub').from('sources').select('*').eq('run_id', run_id).eq('status', 'done'),
    ]);

    if (runRes.error) throw runRes.error;

    const run = runRes.data;
    const summary = summaryRes.data;
    const docs = docsRes.data ?? [];
    const sources = sourcesRes.data ?? [];

    const briefTitle = (run.manual_brief as { goal?: string } | null)?.goal ?? run.title;

    const sourceList = sources.map((s: Record<string, unknown>, i: number) =>
      `Kilde ${i + 1}: ${(s.title as string) ?? (s.url as string) ?? (s.pdf_path as string)}`
    ).join('\n');

    const summarySection = summary?.content
      ? `INNSIKTSOPPSUMMERING:\n${JSON.stringify(summary.content, null, 2)}`
      : '';

    const docSections = docs.slice(0, 5).map((d: Record<string, unknown>, i: number) => {
      const c = d.content as Record<string, unknown> | null;
      return `KILDE ${i + 1} INNSIKT:\n${JSON.stringify({
        summary: (c as { summary?: unknown })?.summary,
        key_facts: (c as { key_facts?: unknown })?.key_facts,
        use_cases: (c as { use_cases?: unknown })?.use_cases,
        narrative: (c as { narrative?: unknown })?.narrative,
        examples: (c as { examples?: unknown })?.examples,
        risks: (c as { risks?: unknown })?.risks,
        safe_phrases: (c as { safe_phrases?: unknown })?.safe_phrases,
      }, null, 2)}`;
    }).join('\n\n---\n\n');

    const userPrompt = `Du lager et komplett grunnlagsdokument for GS1 Norway kommunikasjonsteam.

BRIEF: ${briefTitle}
MÅLGRUPPE: ${run.audience_level ?? 'GS1 Norway kommunikasjonsteam'}
OUTPUT-TYPE: ${run.output_type ?? 'ukjent'}
ØNSKET EFFEKT: ${run.desired_effect ?? 'ukjent'}

KILDER:
${sourceList}

${summarySection}

${docSections}

Returner KUN valid JSON i dette eksakte formatet:
{
  "purpose_audience": "Én paragraf om formål med innholdet og hvem det er for",
  "key_facts": [{"fact": "...", "source": "Kilde N"}],
  "use_cases": [{"case": "...", "value": "...", "gs1_role": "..."}],
  "narrative": {
    "red_thread": "Den overordnede historien / røde tråden",
    "recommended_angle": "Anbefalt journalistisk/kommunikativ vinkling",
    "support_points": ["støttepunkt 1", "støttepunkt 2"]
  },
  "examples": [{"example": "...", "shows": "...", "source": "Kilde N"}],
  "risks": [{"statement": "...", "concern": "...", "ks_required": true}],
  "glossary": [{"term": "...", "definition": "..."}],
  "sources": [{"title": "...", "url_or_name": "..."}]
}`;

    const system = `Du er InfoHub, et profesjonelt research-verktøy for GS1 Norway. Du lager grunnlagsdokumenter som kommunikasjonsteamet bruker som fundament for videre innholdsproduksjon. Dokumentet skal være presist, kildeforankret og klart strukturert. Svar alltid på norsk bokmål. Returner kun valid JSON.`;

    const raw = await callClaude(system, userPrompt, 8000);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in Claude response');
    const content = JSON.parse(jsonMatch[0]);

    await supabase
      .schema('infohub')
      .from('foundation_documents')
      .upsert({ run_id, content, status: 'draft' }, { onConflict: 'run_id' });

    return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('infohub-foundation error:', msg);
    return new Response(JSON.stringify({ error: msg }), { status: 500 });
  }
});
