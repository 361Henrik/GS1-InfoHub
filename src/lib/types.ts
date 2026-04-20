// ============================================================
// GS1 InfoHub v1.0 — TypeScript interfaces
// Mirrors supabase/schema.sql exactly. Zero any.
// ============================================================

// ---- DynamiskBrief (read-only, brief.briefs) ----------------

export interface Brief {
  id: string;
  created_at: string;
  topic: string;
  audience: string;
  channels: string[];
  generated_brief: string | null;
  status: 'draft' | 'approved' | 'archived';
}

// ---- Manual brief (stored as JSONB in runs.manual_brief) ----

export interface ManualBrief {
  goal: string;
  audience: string;
  planned_output: 'artikkel' | 'webinar' | 'linkedin' | 'nyhetsbrev' | 'intern';
  key_questions: string[];
  must_include: string;
  must_avoid: string;
}

// ---- infohub.runs -------------------------------------------

export type RunStatus = 'draft' | 'running' | 'completed';
export type OutputType = 'artikkel' | 'webinar' | 'linkedin' | 'nyhetsbrev' | 'intern';
export type DesiredEffect = 'forstaelse' | 'handling' | 'prioritering' | 'beslutning';
export type OutputFormat = 'kort' | 'standard' | 'dyp';

export interface Run {
  id: string;
  created_at: string;
  updated_at: string;
  brief_id: string | null;
  manual_brief: ManualBrief | null;
  title: string;
  status: RunStatus;
  extraction_profiles: string[];
  custom_extraction_points: string[];
  output_type: OutputType | null;
  desired_effect: DesiredEffect | null;
  audience_level: string | null;
  scope_limits: string | null;
  output_format: OutputFormat;
  tags: string[];
}

// ---- infohub.sources ----------------------------------------

export type SourceType = 'url' | 'pdf';
export type SourceStatus = 'pending' | 'processing' | 'done' | 'error';

export interface Source {
  id: string;
  created_at: string;
  run_id: string;
  type: SourceType;
  url: string | null;
  pdf_path: string | null;
  title: string | null;
  status: SourceStatus;
  extracted_text: string | null;
}

// ---- infohub.insight_documents ------------------------------

export type InsightDocStatus = 'pending' | 'generating' | 'done' | 'error';

export interface InsightKeyFact {
  fact: string;
  source_ref: string;
}

export interface InsightUseCase {
  case: string;
  value: string;
  source_ref: string;
}

export interface InsightNarrative {
  red_thread: string;
  main_message: string;
  support_messages: string[];
}

export interface InsightExample {
  example: string;
  relevance: string;
  source_ref: string;
}

export interface InsightRisk {
  risk: string;
  reason: string;
  ks_required: boolean;
}

export interface InsightContent {
  summary: string[];
  key_facts: InsightKeyFact[];
  use_cases: InsightUseCase[];
  narrative: InsightNarrative;
  examples: InsightExample[];
  risks: InsightRisk[];
  safe_phrases: string[];
  source_references: Record<string, string>;
}

export interface InsightDocument {
  id: string;
  created_at: string;
  run_id: string;
  source_id: string;
  content: InsightContent | null;
  status: InsightDocStatus;
}

// ---- infohub.insight_summaries ------------------------------

export type InsightSummaryStatus = 'pending' | 'generating' | 'done' | 'error';

export interface SummaryKeyFact {
  fact: string;
  source: string;
}

export interface SummaryUseCase {
  case: string;
  value: string;
}

export interface SummaryExample {
  example: string;
  source: string;
}

export interface SummaryContent {
  top_findings: string[];
  red_thread: string[];
  key_facts: SummaryKeyFact[];
  use_cases: SummaryUseCase[];
  examples: SummaryExample[];
  quality_checks: string[];
  sources: string[];
}

export interface InsightSummary {
  id: string;
  created_at: string;
  run_id: string;
  content: SummaryContent | null;
  status: InsightSummaryStatus;
}

// ---- infohub.foundation_documents ---------------------------

export type FoundationDocStatus = 'draft' | 'approved';

export interface FoundationKeyFact {
  fact: string;
  source: string;
}

export interface FoundationUseCase {
  case: string;
  value: string;
  gs1_role: string;
}

export interface FoundationNarrative {
  red_thread: string;
  recommended_angle: string;
  support_points: string[];
}

export interface FoundationExample {
  example: string;
  shows: string;
  source: string;
}

export interface FoundationRisk {
  statement: string;
  concern: string;
  ks_required: boolean;
}

export interface GlossaryEntry {
  term: string;
  definition: string;
}

export interface FoundationSource {
  title: string;
  url_or_name: string;
}

export interface FoundationContent {
  purpose_audience: string;
  key_facts: FoundationKeyFact[];
  use_cases: FoundationUseCase[];
  narrative: FoundationNarrative;
  examples: FoundationExample[];
  risks: FoundationRisk[];
  glossary: GlossaryEntry[];
  sources: FoundationSource[];
}

export interface FoundationDocument {
  id: string;
  created_at: string;
  updated_at: string;
  run_id: string;
  content: FoundationContent | null;
  user_notes: string | null;
  status: FoundationDocStatus;
}

// ---- Brief context shape passed to Edge Functions -----------

export interface BriefContext {
  topic: string;
  audience: string;
  channels: string[];
  output_type: string | null;
  desired_effect: string | null;
  scope_limits: string | null;
}
