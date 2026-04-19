-- ============================================================
-- GS1 InfoHub v1.0 — Supabase Schema
-- Same project as GS1-DynamiskBrief
-- Run this AFTER the DynamiskBrief schema (brief schema must exist)
-- ============================================================

-- InfoHub schema
create schema if not exists infohub;

-- ============================================================
-- RUNS — each research session
-- ============================================================
create table infohub.runs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  -- Brief source: one of these is set
  brief_id uuid references brief.briefs(id) on delete set null,
  manual_brief jsonb,  -- {goal, audience, planned_output, key_questions[], must_include, must_avoid}

  -- Run metadata
  title text not null,  -- auto-derived from brief topic or manual goal
  status text not null default 'draft'
    check (status in ('draft', 'running', 'completed')),

  -- Step 3: extraction profiles
  extraction_profiles text[] default '{}',
  custom_extraction_points text[] default '{}',

  -- Step 4: mini-interview answers
  output_type text,     -- artikkel / webinar / linkedin / nyhetsbrev / intern
  desired_effect text,  -- forstaelse / handling / prioritering / beslutning
  audience_level text,  -- free text: who + knowledge level
  scope_limits text,    -- what NOT to extract
  output_format text default 'standard'
    check (output_format in ('kort', 'standard', 'dyp')),

  -- Library
  tags text[] default '{}'
);

-- Auto-update updated_at
create or replace function infohub.update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger runs_updated_at
  before update on infohub.runs
  for each row execute function infohub.update_updated_at();

-- ============================================================
-- SOURCES — URLs and PDFs per run
-- ============================================================
create table infohub.sources (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  run_id uuid not null references infohub.runs(id) on delete cascade,

  type text not null check (type in ('url', 'pdf')),
  url text,                -- for type='url'
  pdf_path text,           -- Supabase Storage path: {run_id}/{filename}
  title text,              -- user-provided or auto-detected from page/filename

  status text not null default 'pending'
    check (status in ('pending', 'processing', 'done', 'error')),

  extracted_text text      -- raw text after fetch/parse (max ~100k chars)
);

-- ============================================================
-- INSIGHT DOCUMENTS — AI-generated per source
-- ============================================================
create table infohub.insight_documents (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  run_id uuid not null references infohub.runs(id) on delete cascade,
  source_id uuid not null references infohub.sources(id) on delete cascade,

  -- Structured JSON from Claude extraction
  -- Shape: {
  --   summary: string[],
  --   key_facts: [{fact, source_ref}],
  --   use_cases: [{case, value, source_ref}],
  --   narrative: {red_thread, main_message, support_messages[]},
  --   examples: [{example, relevance, source_ref}],
  --   risks: [{risk, reason, ks_required}],
  --   safe_phrases: string[],
  --   source_references: {section: ref}
  -- }
  content jsonb,

  status text not null default 'pending'
    check (status in ('pending', 'generating', 'done', 'error'))
);

-- ============================================================
-- INSIGHT SUMMARIES — cross-source synthesis per run
-- ============================================================
create table infohub.insight_summaries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  run_id uuid not null references infohub.runs(id) on delete cascade,

  -- Shape: {
  --   top_findings: string[],
  --   red_thread: string[],
  --   key_facts: [{fact, source}],
  --   use_cases: [{case, value}],
  --   examples: [{example, source}],
  --   quality_checks: string[],
  --   sources: string[]
  -- }
  content jsonb,

  status text not null default 'pending'
    check (status in ('pending', 'generating', 'done', 'error')),

  unique(run_id)
);

-- ============================================================
-- FOUNDATION DOCUMENTS — final "grunnlagsdokument" per run
-- ============================================================
create table infohub.foundation_documents (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  run_id uuid not null references infohub.runs(id) on delete cascade,

  -- Shape: {
  --   purpose_audience: string,
  --   key_facts: [{fact, source}],
  --   use_cases: [{case, value, gs1_role}],
  --   narrative: {red_thread, recommended_angle, support_points[]},
  --   examples: [{example, shows, source}],
  --   risks: [{statement, concern, ks_required}],
  --   glossary: [{term, definition}],
  --   sources: [{title, url_or_name}]
  -- }
  content jsonb,

  user_notes text,  -- user edits and additions
  status text not null default 'draft'
    check (status in ('draft', 'approved')),

  unique(run_id)
);

create trigger foundation_docs_updated_at
  before update on infohub.foundation_documents
  for each row execute function infohub.update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY — public access (no auth in v1)
-- ============================================================
alter table infohub.runs enable row level security;
alter table infohub.sources enable row level security;
alter table infohub.insight_documents enable row level security;
alter table infohub.insight_summaries enable row level security;
alter table infohub.foundation_documents enable row level security;

create policy "Public full access - runs"
  on infohub.runs for all using (true) with check (true);

create policy "Public full access - sources"
  on infohub.sources for all using (true) with check (true);

create policy "Public full access - insight_documents"
  on infohub.insight_documents for all using (true) with check (true);

create policy "Public full access - insight_summaries"
  on infohub.insight_summaries for all using (true) with check (true);

create policy "Public full access - foundation_documents"
  on infohub.foundation_documents for all using (true) with check (true);

-- ============================================================
-- CROSS-SCHEMA ACCESS — read approved briefs from DynamiskBrief
-- Add this policy IF it does not already exist in the DynamiskBrief schema
-- ============================================================
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'brief'
      and tablename = 'briefs'
      and policyname = 'Public can read approved briefs'
  ) then
    execute $policy$
      create policy "Public can read approved briefs"
        on brief.briefs for select
        using (status = 'approved')
    $policy$;
  end if;
end;
$$;

-- ============================================================
-- STORAGE — create bucket for PDF uploads
-- Run via Supabase Dashboard > Storage > New bucket:
--   Name: infohub-sources
--   Public: false
--   File size limit: 10MB
--   Allowed MIME types: application/pdf
-- ============================================================

-- ============================================================
-- EDGE FUNCTION SECRETS — set via CLI (not stored in schema)
--   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
--   supabase secrets set SUPABASE_URL=<your-project-url>
--   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
-- ============================================================
