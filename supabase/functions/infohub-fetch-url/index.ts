import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*' } });
  }

  try {
    const { source_id, url } = await req.json() as { source_id: string; url: string };

    if (!source_id || !url) {
      return new Response(JSON.stringify({ error: 'source_id and url required' }), { status: 400 });
    }

    await supabase.schema('infohub').from('sources').update({ status: 'processing' }).eq('id', source_id);

    const response = await fetch(url, {
      headers: { 'User-Agent': 'GS1-InfoHub/1.0 (+https://infohub.gs1.threesix1.com)' },
      signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const html = await response.text();
    const text = stripHtml(html).slice(0, 100_000);

    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : url;

    await supabase
      .schema('infohub')
      .from('sources')
      .update({ extracted_text: text, status: 'done', title })
      .eq('id', source_id);

    return new Response(JSON.stringify({ success: true, char_count: text.length }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('infohub-fetch-url error:', msg);
    const body = await req.json().catch(() => ({} as Record<string, unknown>));
    const sourceId = (body as { source_id?: string }).source_id;
    if (sourceId) {
      await supabase.schema('infohub').from('sources').update({ status: 'error' }).eq('id', sourceId);
    }
    return new Response(JSON.stringify({ error: msg }), { status: 500 });
  }
});
