import { supabase } from './supabase';
import type { BriefContext, OutputFormat } from './types';

async function invoke<T>(name: string, body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke<T>(name, { body });
  if (error) throw new Error(`Edge function ${name} failed: ${error.message}`);
  return data as T;
}

export async function fetchUrl(sourceId: string, url: string): Promise<void> {
  await invoke('infohub-fetch-url', { source_id: sourceId, url });
}

export async function parsePdf(sourceId: string, pdfPath: string): Promise<void> {
  await invoke('infohub-parse-pdf', { source_id: sourceId, pdf_path: pdfPath });
}

export async function extractInsight(
  insightDocumentId: string,
  sourceText: string,
  briefContext: BriefContext,
  profiles: string[],
  customPoints: string[],
  outputFormat: OutputFormat,
): Promise<void> {
  await invoke('infohub-extract', {
    insight_document_id: insightDocumentId,
    source_text: sourceText,
    brief_context: briefContext,
    profiles,
    custom_points: customPoints,
    output_format: outputFormat,
  });
}

export async function summarizeInsights(runId: string): Promise<void> {
  await invoke('infohub-summarize', { run_id: runId });
}

export async function buildFoundation(runId: string): Promise<void> {
  await invoke('infohub-foundation', { run_id: runId });
}
