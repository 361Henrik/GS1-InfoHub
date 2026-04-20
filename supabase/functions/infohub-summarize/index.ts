import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')!;

async function callClaude(system: string, user: string, maxTokens = 4000): Promise<string> {
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

    const [runRes, docsRes] = await Promise.all([
      supabase.schema('infohub').from('runs').select('*').eq('id', run_id).single(),
      supabase.schema('infohub').from('insight_documents').select('*').eq('run_id', run_id).eq('status', 'done'),
    ]);

    if (runRes.error) throw runRes.error;
    if (docsRes.error) throw docsRes.error;

    const run = runRes.data;
    const docs = docsRes.data ?? [];

    const briefTitle = (run.manual_brief as { goal?: string } | null)?.goal ?? run.title;

    const docSummaries = docs.map((d: Record<string, unknown>, i: number) => {
      const c = d.content as Record<string, unknown> | null;
      return `KILDE ${i + 1}:\nSammendrag: ${JSON.stringify((c as { summary?: unknown })?.summary ?? [])}\nNøkkelfakta: ${JSON.stringify((c as { key_facts?: unknown })?.key_facts ?? [])}\nRisiko: ${JSON.stringify((c as { risks?: unknown })?.risks ?? [])}`;
    }).join('\n\n---\n\n');

    const userPrompt = `Du lager en krysskildetlig innsiktsoppsummering for GS1 Norway.

BRIEF: ${briefTitle}
MÅLGRUPPE: ${run.audience_level ?? 'GS1 Norway kommunikasjonsteam'}
OUTPUT-TYPE: ${run.output_type ?? 'ukjent'}

INNSIKTSDOKUMENTER:
${docSummaries}

Returner KUN valid JSON:
{
  "top_findings": ["5–7 viktigste funn på tvers av alle kilder"],
  "red_thread": ["2–3 forslag til rød tråd / budskapslinjer"],
  "key_facts": [{"fact": "...", "source": "Kilde N"}],
  "use_cases": [{"case": "...", "value": "..."}],
  "examples": [{"example": "...", "source": "Kilde N"}],
  "quality_checks": ["påstander eller funn som bør KS-sjekkes"],
  "sources": ["Kilde 1: ...", "Kilde 2: ..."]
}`;

    const system = `Du er InfoHub, et profesjonelt research-verktøy for GS1 Norway. Du syntetiserer innsikt på tvers av flere kilder og presenterer en helhetlig oversikt. Svar alltid på norsk bokmål. Returner kun valid JSON.`;

    const raw = await callClaude(system, userPrompt, 5000);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in Claude response');
    const content = JSON.parse(jsonMatch[0]);

    await supabase
      .schema('infohub')
      .from('insight_summaries')
      .upsert({ run_id, content, status: 'done' }, { onConflict: 'run_id' });

    return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('infohub-summarize error:', msg);
    return new Response(JSON.stringify({ error: msg }), { status: 500 });
  }
});
