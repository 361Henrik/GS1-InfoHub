# InfoHub v1.0 — Functional Specification

Source: GS1 Norway internal document, 2026-02-09

---

## Background

The **Dynamisk Brief** app reduces friction in communication briefs. The next bottleneck (identified in October 2025 workshop) is after the brief is approved:

- The team must find and read source material
- Identify what facts are relevant for the target audience
- Ensure claims are source-backed

InfoHub solves this by being **brief-driven** (not generic summaries), **fact-checkable** (clear sources), and producing content ready for the Publisering module.

---

## The three-app workflow

```
1. Dynamisk Brief
   → Approved "contract" between subject matter and communications: what, why, who, when

2. InfoHub
   → Takes approved brief (or manual context)
   → Reads sources (URLs + PDFs)
   → Extracts insight using structured profiles
   → Produces insight documents + summary + foundation document

3. Publisering
   → Uses Dynamisk Brief + InfoHub outputs
   → Generates channel-adapted text drafts (web/LinkedIn/newsletter)
   → Human editorial QA before publishing
```

---

## Step-by-step flow

### Step 1 — Secure login
Authenticated GS1 Norway users only.
*Note: skipped in v1 build — no auth.*

### Step 2 — Choose brief or enter context manually
**Option A:** Import approved brief from Dynamisk Brief
**Option B:** Manual entry — goal, audience, planned output, 3–7 key questions, must include/avoid

### Step 3 — Add sources
- Paste URLs (up to 10 in v1)
- Upload PDFs
- Each source gets metadata: title, type, date, tags

### Step 4 — Choose extraction profiles
Select one or more:
1. **Key facts and main points** — 5–10 points, definitions, numbers, requirements
2. **Facts and claim basis** — verifiable claims with source reference, what needs QA
3. **Use cases and member value** — problem solved, who benefits, effect, GS1 role
4. **Narrative and message line** — red thread, main/support messages, analogies
5. **Examples and illustrations** — 3–5 concrete cases/scenarios/quotes
6. **Risks and caveats** — sensitive claims, uncertainties, what needs extra QA

Plus custom extraction points (free text).

### Step 5 — Clarification mini-interview
Before extraction runs, user defines:
- What will this become? (article / webinar / LinkedIn / newsletter / internal)
- Desired effect (understanding / action / prioritization / decision)
- Who needs to understand this? (audience + knowledge level)
- What should NOT be extracted (scope limits, claims requiring extra QA)
- Output format: Kort / Standard / Dyp

InfoHub mirrors back the full instruction (5–10 lines) for user approval before running.

### Step 6 — Source insight documents
Generated per source. Contains:
- Summary (5–10 points tied to brief goal)
- Key facts
- Use cases / member value
- Narrative / message line
- Examples
- Risks and caveats
- "Safe phrases" (reusable text snippets)
- Source references

Downloadable as Word (.docx).

### Step 7 — Insight summary (innsiktsoppsummering)
Cross-source synthesis:
- 10–15 top findings across all sources
- 1–3 red thread variants
- Prioritized key facts (with source refs)
- 2–5 use cases
- 3–5 examples
- Quality check items
- Complete source list

### Step 8 — Library
All runs stored with date/title/brief. Searchable by topic, sector, channel, audience. Filterable. Tagged.

### Step 9 — Foundation document (grunnlagsdokument)
The final output — GS1's internal reference document for this case. Used by Publisering module.

InfoHub generates draft from: brief + insight documents + insight summary.

User can edit, add notes, add 1–3 extra context sources.

Contains:
- Purpose and audience
- 5–10 key facts (with source refs)
- 2–5 use cases
- Narrative (red thread + recommended angle)
- 3–5 examples
- Risks / what NOT to say
- Glossary (if relevant)
- Complete source list (traceable)

Downloadable as Word (.docx). Can be marked "approved".

---

## V1 scope

Included:
- Secure login (skipped in this build)
- Brief import (from Dynamisk Brief or manual)
- Source input: URL + PDF upload
- Extraction profiles + custom checklist
- Source insight documents (text only)
- Insight summary (cross-source)
- Library with search/filter/tags
- Foundation document (editable)
- Word export for insight docs + foundation doc

**Not in v1:**
- Continuous URL monitoring/alerts
- Automatic large-scale crawling
- Direct CMS/SoMe/newsletter integrations
- Complex approval chains / RACI roles

---

## Security (v1)

- Access limited to authorized GS1 Norway users (skipped in this build)
- URL/PDF used only to generate insight documents
- Output stored as reusable internal assets
- Raw PDF retention configurable (conservative default)
