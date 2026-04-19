# CLAUDE.md — GS1 InfoHub v1.0

> Build brief for Claude Code. Read every word. Enter plan mode first. Wait for approval before writing code.

---

## What you are building

**InfoHub** is an AI-powered research extraction tool for GS1 Norway's communication team. It sits between two other apps in the GS1 Norway AI suite:

```
Dynamisk Brief → InfoHub → Publisering
(brief creation)  (research)  (content production)
```

InfoHub takes an approved communication brief, lets users add sources (URLs + PDFs), runs Claude AI extraction against those sources using structured profiles, and produces reusable insight documents, a cross-source summary, and a final foundation document — all downloadable as Word (.docx).

**This is NOT a knowledge base reader.** The current `src/App.tsx` is a placeholder and must be completely replaced. Keep `src/index.css` and `src/main.tsx` as-is.

---

## Repo + deploy

- **GitHub:** `361Henrik/GS1-InfoHub`
- **Deploy:** Vercel, auto-deploy from `main`
- **URL:** `infohub.gs1.threesix1.com`
- **Same Supabase project as `361Henrik/GS1-DynamiskBrief`**
  - InfoHub reads `brief.briefs` directly from the shared database
  - InfoHub writes to the `infohub` schema (see schema below)

---

## Stack — exact versions, no substitutions

```
React 19 + TypeScript strict
Vite 6
Tailwind CSS v4 (via @tailwindcss/vite)
Supabase JS v2
Lucide React
Motion (Framer Motion v12)
docx (npm) — for Word export
```

Already in `package.json`. Add `docx` as a new dependency.

**No React Router** — use a simple URL-hash router or `useState`-based view switcher. The app is small enough.

---

## Authentication

**None in v1.** No login required. All Supabase tables use public access RLS policies. Do not implement any auth flow.

---

## Language

**All UI text in Norwegian (Bokmål).** Copy the tone from the existing DynamiskBrief UI — professional, clear, not corporate.

---

## Design system — GS1 Nordic tokens

These tokens are already defined in `src/index.css`. Use only these — no custom colours, no Tailwind defaults for colour.

```
Colours:
  nordic-bg          #F7F7F5   — page background
  nordic-surface     #FFFFFF   — cards, panels
  nordic-border      #E6E5E0   — all borders
  nordic-text        #2A2D30   — body text
  nordic-text-muted  #666A6D   — secondary/helper text
  nordic-blue        #324A5F   — primary brand, headings, CTAs
  nordic-blue-light  #F0F3F5   — selected state backgrounds
  nordic-accent      #C87963   — labels, icons, highlights (sparingly)
  nordic-accent-light #FBF4F2  — accent backgrounds
  nordic-green       #6B8E7B   — success states
  nordic-green-light #F2F6F4   — success backgrounds

Typography:
  font-sans → Inter (body, labels, UI)
  font-serif → Lora (headings h1-h3, italic)
```

**Header pattern** — match DynamiskBrief exactly:
```tsx
<header className="bg-nordic-surface border-b border-nordic-border px-8 py-5 flex items-center justify-between">
  <div className="flex items-center gap-3">
    <span className="text-nordic-blue font-serif italic text-xl border-b-2 border-nordic-accent">GS1</span>
    <span className="text-[10px] tracking-widest uppercase text-nordic-text-muted">Norway</span>
    <span className="text-nordic-border mx-2">|</span>
    <span className="text-sm font-medium text-nordic-text">InfoHub</span>
  </div>
  <span className="text-xs text-nordic-text-muted hidden md:block">infohub.gs1.threesix1.com</span>
</header>
```

---

## Database schema

Same Supabase project as Dynamisk Brief. The `brief` schema already exists. InfoHub creates its own `infohub` schema.

See `supabase/schema.sql` for the full schema. Summary of tables:

| Table | Purpose |
|---|---|
| `brief.briefs` | READ ONLY — from DynamiskBrief. Fetch where `status = 'approved'` |
| `infohub.runs` | Each research session. Linked to a brief or has a manual brief |
| `infohub.sources` | URLs and PDFs added to a run |
| `infohub.insight_documents` | AI-generated insight doc per source |
| `infohub.insight_summaries` | Cross-source synthesis per run |
| `infohub.foundation_documents` | Final editable foundation document per run |

**Supabase Storage bucket:** `infohub-sources` (private). Used for PDF uploads. Path format: `{run_id}/{filename}`.

---

## Environment variables

```bash
# Frontend (Vite)
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# Edge Functions only — set via Supabase Dashboard > Edge Functions > Secrets
# supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_API_KEY=
```

The `ANTHROPIC_API_KEY` is a **server-side secret only**. Never expose it in frontend code. It is used exclusively inside Supabase Edge Functions via `Deno.env.get('ANTHROPIC_API_KEY')`.

---

## Application routes

Use a simple hash-based router (`window.location.hash`) or a `useState`-driven view system. No React Router needed.

| View | Hash / state | Description |
|---|---|---|
| Library | `#/` (default) | All previous runs, searchable/filterable |
| New run | `#/ny` | Steps 1–5: brief + sources + profiles + clarification |
| Run detail | `#/kjoring/:id` | Active run — steps 6–9 progress view |
| Foundation doc | `#/kjoring/:id/grunnlag` | Final editable foundation document |

---

## The 9-step user flow

### Step 1 — Velg brief (choose brief)

Two modes side by side:

**Mode A — Hent fra Dynamisk Brief:**
- Query `brief.briefs` where `status = 'approved'`
- Show as a list with: topic, audience, channels, date
- Selecting one sets the run's `brief_id`

**Mode B — Skriv inn kontekst manuelt:**
- Simple form: Mål/hensikt (textarea), Målgruppe (text), Planlagt output (select: Artikkel / Webinar / LinkedIn / Nyhetsbrev / Intern orientering), 3–7 nøkkelspørsmål (dynamic text inputs), Must include / must avoid (two textareas)
- Stored in `manual_brief` JSONB

On selection/submission → create `infohub.runs` record, get the `run_id`, move to Step 2.

---

### Step 2 — Legg til kilder (add sources)

Two input methods:

**URL:**
- Input field + "Legg til" button
- Each URL added appears in a list with a status badge (Venter / Henter / Klar / Feil)
- On add: insert into `infohub.sources` (type: 'url'), call Edge Function `infohub-fetch-url`

**PDF:**
- File picker (accept=".pdf"), multiple files allowed
- On select: upload to Supabase Storage at `{run_id}/{filename}`, insert into `infohub.sources` (type: 'pdf', pdf_path), call Edge Function `infohub-parse-pdf`

Both Edge Functions update `sources.extracted_text` and `sources.status` on completion.

Show live status per source. User can add more sources or remove pending ones. Must have at least 1 source with status 'done' to continue.

---

### Step 3 — Velg uttaksprofiler (choose extraction profiles)

6 standard profiles as checkboxes (multi-select, at least 1 required):

1. **Nøkkelfakta og hovedpoenger** — De 5–10 viktigste poengene, definisjoner, tall/krav
2. **Fakta- og påstandsgrunnlag** — Konkrete påstander med kildehenvisning, hva må KS
3. **Brukstilfeller og medlemsverdi** — Problemet som løses, hvem får verdi, effekter, GS1s rolle
4. **Historie og budskapslinje** — Rød tråd, hoved- og støttebudskap, formuleringer/analogier
5. **Eksempler og illustrasjoner** — 3–5 konkrete eksempler, case, scenarioer, sitater
6. **Risiko og forbehold** — Sensitive påstander, usikkerheter, hva bør KS

**Custom extraction points:** a dynamic list of free-text inputs ("Legg til eget punkt"). Examples shown as ghost text: "Finn 3 eksempler for helsesektoren", "Én ikke-teknisk forklaring for ledere"

Save to `runs.extraction_profiles` and `runs.custom_extraction_points`.

---

### Step 4 — Presisering (mini-interview / clarification)

Short form before extraction runs:

**Output type** (select): Artikkel / Webinar / LinkedIn-innlegg / Nyhetsbrev / Intern orientering

**Ønsket effekt** (select): Forståelse / Handling / Prioritering / Beslutning

**Hvem skal forstå dette** (text): målgruppe + kunnskapsnivå — pre-filled from brief if available

**Hva skal IKKE hentes ut** (textarea): topics out of scope, terms to avoid, claims needing extra QA

**Output format** (radio): Kort (1-side per kilde) / Standard (strukturerte innsiktsdokumenter) / Dyp (flere detaljer og kildehenvisninger)

Save to `runs` columns: `output_type`, `desired_effect`, `audience_level`, `scope_limits`, `output_format`.

---

### Step 5 — Bekreft og kjør (confirm and run)

Show a summary card before extraction starts:
- Brief: topic + audience
- Antall kilder: N
- Valgte profiler: listed
- Output format: Kort / Standard / Dyp
- Scope limits: if any

"Kjør InfoHub" button → triggers extraction for all sources with status 'done'.

For each source:
1. Insert `infohub.insight_documents` record with status 'generating'
2. Call Edge Function `infohub-extract` with: source text, brief context, profiles, mini-interview answers
3. Edge Function returns structured JSON → update `insight_documents.content` and set status 'done'

Show real-time progress per source (polling every 2s or optimistic update).

---

### Step 6 — Innsiktsdokumenter (insight documents)

After all sources are processed, show one card per source with the insight document content.

Each insight document card shows (sections toggled open/closed):
- **Sammendrag** — 5–10 punkt knyttet til briefens formål
- **Nøkkelfakta** — tall, definisjoner, krav, endringer
- **Brukstilfeller** — praktisk nytte + effekt
- **Historie/budskapslinje** — rød tråd + vinkling
- **Eksempler** — scenarioer/case
- **Risiko og forbehold** — hva bør KS / unngås
- **Trygge formuleringer** — korte tekstbiter som kan gjenbrukes
- **Kildehenvisning** — hvilken kilde

Items marked `[KS]` in the AI output are visually flagged with an amber indicator.

Each card has a "Last ned som Word" button → download that source's insight doc as .docx.

---

### Step 7 — Innsiktsoppsummering (insight summary)

"Generer innsiktsoppsummering" button → calls Edge Function `infohub-summarize`.

Input: all insight_documents for this run + brief context.

Output stored in `infohub.insight_summaries.content`:
```json
{
  "top_findings": [],
  "red_thread": [],
  "key_facts": [],
  "use_cases": [],
  "examples": [],
  "quality_checks": [],
  "sources": []
}
```

Display as a clean document view. "Last ned som Word" button.

---

### Step 8 — Grunnlagsdokument (foundation document)

"Lag grunnlagsdokument" button → calls Edge Function `infohub-foundation`.

Input: brief + insight_summary + all insight_documents.

Output stored in `infohub.foundation_documents.content`:
```json
{
  "purpose_audience": "",
  "key_facts": [],
  "use_cases": [],
  "narrative": {},
  "examples": [],
  "risks": [],
  "glossary": [],
  "sources": []
}
```

**The foundation document is editable.** Render as a form where each section can be edited. User can add notes in `foundation_documents.user_notes`. "Lagre" saves to DB.

"Merk som godkjent" button → sets `status = 'approved'`.

"Last ned som Word" → full grunnlagsdokument as .docx.

---

### Library view (home screen)

List of all `infohub.runs` ordered by `created_at DESC`.

Each run card shows:
- Title (from brief topic or manual input)
- Date
- Number of sources
- Status (Utkast / Fullført)
- Tags (if any)

Filter by: status, tags. Search by title.

Click → go to run detail view.

"Ny kjøring" CTA → starts new run.

---

## Supabase Edge Functions

All functions live in `supabase/functions/`. Each is a Deno TypeScript file.

### `infohub-fetch-url`

**Purpose:** Fetch a URL and extract plain text (strip HTML).

**Request body:**
```json
{ "source_id": "uuid", "url": "https://..." }
```

**Logic:**
1. Fetch the URL with a proper User-Agent header
2. Strip HTML tags, remove scripts/styles, normalize whitespace
3. Truncate to max 100,000 characters
4. Update `infohub.sources` set `extracted_text = text, status = 'done'` where `id = source_id`
5. On error: set `status = 'error'`

**Response:** `{ "success": true, "char_count": N }`

---

### `infohub-parse-pdf`

**Purpose:** Read a PDF from Supabase Storage and extract text.

**Request body:**
```json
{ "source_id": "uuid", "pdf_path": "run_id/filename.pdf" }
```

**Logic:**
1. Download file from Supabase Storage bucket `infohub-sources`
2. Parse PDF to plain text using a Deno-compatible PDF text extractor
3. Truncate to max 100,000 characters
4. Update `infohub.sources` set `extracted_text = text, status = 'done'`
5. On error: set `status = 'error'`

**Response:** `{ "success": true, "char_count": N }`

---

### `infohub-extract`

**Purpose:** Run Claude AI extraction on a single source.

**Request body:**
```json
{
  "insight_document_id": "uuid",
  "source_text": "...",
  "brief_context": {
    "topic": "...",
    "audience": "...",
    "channels": [],
    "output_type": "...",
    "desired_effect": "...",
    "scope_limits": "..."
  },
  "profiles": ["Nøkkelfakta og hovedpoenger"],
  "custom_points": [],
  "output_format": "standard"
}
```

**Claude API call — Model:** `claude-sonnet-4-6`

**System prompt:**
```
Du er InfoHub, et profesjonelt research-verktøy for GS1 Norway sitt kommunikasjonsteam.

Din oppgave er å analysere kildetekst og trekke ut strukturert innsikt basert på den godkjente briefen og uttaksprofilene som er valgt.

Du skriver IKKE ferdig innhold — du identifiserer og organiserer det som faktisk finnes i kilden, presentert på en måte kommunikasjonsmedarbeidere kan bruke direkte.

Viktige regler:
- Trekk BARE ut informasjon som faktisk finnes i kildeteksten
- Merk påstander som trenger faglig kvalitetssikring med [KS]
- Bruk enkelt, klart norsk — unngå teknisk sjargong med mindre kilden krever det
- Alle fakta og påstander skal referere til hvilken del av kilden de kommer fra
- Returner alltid valid JSON i eksakt format som spesifisert — ingen kommentarer eller forklaringer utenfor JSON-strukturen
```

**User prompt (build dynamically from request body):**

Build the prompt string with brief context, selected profiles, custom points, output format, and source text. Ask Claude to return this exact JSON shape:

```json
{
  "summary": ["punkt 1", "punkt 2"],
  "key_facts": [{"fact": "...", "source_ref": "..."}],
  "use_cases": [{"case": "...", "value": "...", "source_ref": "..."}],
  "narrative": {"red_thread": "...", "main_message": "...", "support_messages": ["..."]},
  "examples": [{"example": "...", "relevance": "...", "source_ref": "..."}],
  "risks": [{"risk": "...", "reason": "...", "ks_required": true}],
  "safe_phrases": ["..."],
  "source_references": {"section_name": "kildetekst-referanse"}
}
```

**Logic:** Parse JSON response → update `infohub.insight_documents` content + status.

---

### `infohub-summarize`

**Purpose:** Cross-source insight summary. Takes all insight_documents for a run + brief context. Returns JSON with top_findings, red_thread variants, key_facts, use_cases, examples, quality_checks, sources. Insert/update `infohub.insight_summaries`.

---

### `infohub-foundation`

**Purpose:** Final foundation document. Takes brief + insight_summary + all insight_documents. Returns JSON with purpose_audience, key_facts, use_cases, narrative, examples, risks, glossary, sources. Insert/update `infohub.foundation_documents`.

---

## Word (.docx) export

Use the `docx` npm package on the **frontend** (no server needed).

Create `src/lib/docx-export.ts` with two exported functions:
- `exportInsightDocument(source: Source, document: InsightDocument): void`
- `exportFoundationDocument(run: Run, document: FoundationDocument): void`

Both functions build a structured Word document from the content JSON and trigger a browser download.

Filename format: `infohub-{run-title-slugified}-{date}.docx`

Items with `ks_required: true` should be visually marked in the Word doc (bold + "[KS]" prefix).

---

## TypeScript types

Create `src/lib/types.ts` with strict interfaces matching all DB tables. Key interfaces:

- `Brief` — from brief.briefs (topic, audience, channels, generated_brief, status)
- `Run` — infohub.runs (all columns)
- `ManualBrief` — JSONB shape for manual_brief column
- `Source` — infohub.sources
- `InsightDocument` + `InsightContent` — infohub.insight_documents
- `InsightSummary` + `SummaryContent` — infohub.insight_summaries
- `FoundationDocument` + `FoundationContent` — infohub.foundation_documents

Zero `any`. All DB column types must be represented exactly.

---

## File structure

```
src/
  App.tsx               # Hash router + view switcher (replace entirely)
  main.tsx              # Keep as-is
  index.css             # Keep as-is — GS1 nordic tokens

  views/
    Library.tsx         # Home: all runs, search/filter
    NewRun.tsx          # Steps 1–5: wizard
    RunDetail.tsx       # Steps 6–9: run progress + documents
    FoundationDoc.tsx   # Editable foundation document

  components/
    Layout.tsx          # Header shell (matches DynamiskBrief)
    StepIndicator.tsx   # 5-step progress bar for new run
    BriefSelector.tsx   # Fetch + display approved briefs
    ManualBriefForm.tsx # Manual brief entry form
    SourceInput.tsx     # URL input + PDF upload
    ExtractionProfiles.tsx
    MiniInterview.tsx
    RunConfirmCard.tsx  # Step 5 summary before extraction
    RunCard.tsx         # Library card
    SourceStatus.tsx    # Source processing badge
    InsightDocCard.tsx  # Collapsible insight document
    KSBadge.tsx         # Amber quality-check indicator
    DocxExportButton.tsx

  lib/
    supabase.ts         # Supabase client
    types.ts            # All TypeScript interfaces
    docx-export.ts      # Word export functions
    edge-functions.ts   # Edge function caller helpers

supabase/
  functions/
    infohub-fetch-url/index.ts
    infohub-parse-pdf/index.ts
    infohub-extract/index.ts
    infohub-summarize/index.ts
    infohub-foundation/index.ts
  schema.sql
```

---

## Build rules

1. **Enter plan mode first.** Present full implementation plan before writing any code. Wait for approval.
2. **TypeScript strict.** Zero `any`. All types from `src/lib/types.ts`.
3. **No broken builds.** `tsc --noEmit` must pass before each commit.
4. **Commit format:** `feat:` / `fix:` / `chore:` / `docs:`
5. **Do not rebuild** the DynamiskBrief app. Only read from its `brief.briefs` table.
6. **No login/auth** code anywhere. Do not add it "just in case".
7. **Error states everywhere.** Every async operation: loading + success + error states in UI.
8. **Polling for extraction status.** `setInterval` (2s) while sources are processing. Clear on completion.
9. **Edge function errors.** Always update DB record to `status = 'error'` on failure.
10. **PDF upload max size:** 10MB client-side validation before upload.

---

## What is NOT in v1

Do not build these — they are v2:
- Continuous URL monitoring / crawling
- CMS/SoMe/newsletter integrations
- Complex role-based access or approval chains
- Real-time collaboration
- Automated PDF OCR
- Auto-detection of duplicate runs

---

## Connected apps

| App | URL | Repo | Relation |
|---|---|---|---|
| Dynamisk Brief | dynamiskbrief.gs1.threesix1.com | 361Henrik/GS1-DynamiskBrief | Source of approved briefs (read-only) |
| InfoHub | infohub.gs1.threesix1.com | 361Henrik/GS1-InfoHub | This app |
| Publisering | publish.gs1.threesix1.com | 361Henrik/GS1-Publish | Downstream consumer of foundation docs |

---

## Docs

All reference documents are in `/docs`. Read them before building:
- `docs/infohub-spec.md` — Full functional specification
- `docs/proposal.md` — Client proposal with pricing context

---

*Prepared by ThreeSixtyOne AI — 2026-04-19*
