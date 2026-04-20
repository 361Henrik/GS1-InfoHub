import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getDocumentProxy, extractText } from 'npm:unpdf';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*' } });
  }

  let sourceId: string | undefined;

  try {
    const body = await req.json() as { source_id: string; pdf_path: string };
    sourceId = body.source_id;
    const { pdf_path } = body;

    if (!sourceId || !pdf_path) {
      return new Response(JSON.stringify({ error: 'source_id and pdf_path required' }), { status: 400 });
    }

    await supabase.schema('infohub').from('sources').update({ status: 'processing' }).eq('id', sourceId);

    const { data, error: downloadError } = await supabase.storage
      .from('infohub-sources')
      .download(pdf_path);

    if (downloadError) throw new Error(`Storage download failed: ${downloadError.message}`);

    const buffer = await data.arrayBuffer();
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    const { text } = await extractText(pdf, { mergePages: true });
    const extracted = text.slice(0, 100_000);

    const filename = pdf_path.split('/').pop() ?? pdf_path;

    await supabase
      .schema('infohub')
      .from('sources')
      .update({ extracted_text: extracted, status: 'done', title: filename })
      .eq('id', sourceId);

    return new Response(JSON.stringify({ success: true, char_count: extracted.length }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('infohub-parse-pdf error:', msg);
    if (sourceId) {
      await supabase.schema('infohub').from('sources').update({ status: 'error' }).eq('id', sourceId);
    }
    return new Response(JSON.stringify({ error: msg }), { status: 500 });
  }
});
