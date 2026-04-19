# InfoHub v1 — Client Proposal Summary

Client: GS1 Norway / Anders
Date: 2026-02-10
Prepared by: Henrik C. Høst / ThreeSixtyOne

---

## Problem context

After a communication brief is approved, a consistent bottleneck occurs:
- Reading and processing extensive source material
- Finding the right facts for the target audience
- Ensuring claims are source-verified

Identified as a clear challenge in the October 30, 2025 workshop with the GS1 Norway communications team.

---

## What InfoHub does

InfoHub is a **brief-driven research engine** — not a summarizer. It analyzes and extracts information relevant to the specific communication goal defined in the approved brief.

This ensures: same structured process every time, AI-consistent results (vs. ad hoc GPT prompting), dramatically faster path from approved brief to fact-grounded content.

---

## v1 functionality

- **Brief integration:** Import output from Dynamisk Brief, or enter short context directly
- **Source handling:** PDF upload + URL parsing (not Word docs — complexity/stability reasons)
- **Insight documents:** Structured, reusable insight docs per source
- **Insight summary (innsiktsoppsummering):** Consolidated findings across all sources per brief
- **Library:** Searchable archive of previous research runs for cross-project reuse
- **Export:** Copy/export as PDF or Word

---

## Technical architecture

Same modern stack as Dynamisk Brief — seamless integration, shared infrastructure.

- **Ownership:** All GS1-specific code owned by GS1 Norway
- **Security:** Same login system as Dynamisk Brief
- **Scalability:** Architecture supports v2 features (crawling, monitoring) without major rewrites

---

## Pricing (from proposal)

| Phase | Description | Price |
|---|---|---|
| Discovery & alignment | 3–4 digital meetings, define v1 user journey | NOK 7,500–12,500 ex VAT |
| Development & deployment | Source architecture, AI extraction, library, integrations | NOK 55,000–65,000 ex VAT |
| Operations | Monthly (shared with Dynamisk Brief infrastructure) | NOK 3,000/month ex VAT |
| AI usage costs | Per extraction run | Est. NOK 10–20/run |

Up to 4 users; 1 GS1 admin role.

Timeline: ~4 weeks development, dependent on client feedback cadence.

---

## User journey summary

1. Communication manager opens InfoHub, imports approved brief "GLN for hospitals"
2. Adds link to new EU directive + uploads internal report (up to 10 URLs in v1)
3. System analyzes all sources against brief goals — provides concrete source references
4. User gets prioritized list of data and insights with references for fact-checking
5. Selects which sources and content to use
6. Documentation package for content writing is ready (for use in Publisering module)
7. User manual available on demand for onboarding new users
