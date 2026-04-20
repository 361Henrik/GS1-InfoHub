import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { InsightDocument, Source } from '../lib/types';
import KSBadge from './KSBadge';
import DocxExportButton from './DocxExportButton';
import SourceStatus from './SourceStatus';
import { exportInsightDocument } from '../lib/docx-export';

interface Props {
  source: Source;
  doc: InsightDocument;
}

type Section = 'summary' | 'key_facts' | 'use_cases' | 'narrative' | 'examples' | 'risks' | 'safe_phrases' | 'source_references';

const SECTION_LABELS: Record<Section, string> = {
  summary: 'Sammendrag',
  key_facts: 'Nøkkelfakta',
  use_cases: 'Brukstilfeller',
  narrative: 'Historie og budskapslinje',
  examples: 'Eksempler',
  risks: 'Risiko og forbehold',
  safe_phrases: 'Trygge formuleringer',
  source_references: 'Kildehenvisning',
};

const SECTIONS: Section[] = ['summary', 'key_facts', 'use_cases', 'narrative', 'examples', 'risks', 'safe_phrases', 'source_references'];

export default function InsightDocCard({ source, doc }: Props) {
  const [open, setOpen] = useState(true);
  const [openSections, setOpenSections] = useState<Record<Section, boolean>>(
    Object.fromEntries(SECTIONS.map(s => [s, true])) as Record<Section, boolean>
  );
  const [exporting, setExporting] = useState(false);

  const toggleSection = (s: Section) =>
    setOpenSections(prev => ({ ...prev, [s]: !prev[s] }));

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportInsightDocument(source, doc);
    } finally {
      setExporting(false);
    }
  };

  const c = doc.content;

  return (
    <div className="bg-nordic-surface border border-nordic-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-nordic-bg transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-start">
            <p className="text-sm font-medium text-nordic-text">{source.title ?? source.url ?? source.pdf_path}</p>
            <p className="text-xs text-nordic-text-muted mt-0.5">{source.type === 'url' ? 'URL' : 'PDF'}</p>
          </div>
          <SourceStatus status={doc.status === 'done' ? 'done' : doc.status === 'generating' ? 'processing' : doc.status === 'error' ? 'error' : 'pending'} />
        </div>
        <div className="flex items-center gap-2">
          {doc.status === 'done' && (
            <div onClick={e => e.stopPropagation()}>
              <DocxExportButton onClick={handleExport} loading={exporting} />
            </div>
          )}
          {open ? <ChevronUp size={16} className="text-nordic-text-muted" /> : <ChevronDown size={16} className="text-nordic-text-muted" />}
        </div>
      </button>

      {open && doc.status === 'done' && c && (
        <div className="border-t border-nordic-border divide-y divide-nordic-border">
          {SECTIONS.map(section => {
            const isOpen = openSections[section];
            const hasContent = (() => {
              if (section === 'summary') return c.summary?.length > 0;
              if (section === 'key_facts') return c.key_facts?.length > 0;
              if (section === 'use_cases') return c.use_cases?.length > 0;
              if (section === 'narrative') return !!c.narrative?.red_thread;
              if (section === 'examples') return c.examples?.length > 0;
              if (section === 'risks') return c.risks?.length > 0;
              if (section === 'safe_phrases') return c.safe_phrases?.length > 0;
              if (section === 'source_references') return Object.keys(c.source_references ?? {}).length > 0;
              return false;
            })();
            if (!hasContent) return null;

            return (
              <div key={section}>
                <button
                  onClick={() => toggleSection(section)}
                  className="w-full flex items-center justify-between px-5 py-3 hover:bg-nordic-bg transition-colors text-left"
                >
                  <span className="text-xs font-semibold text-nordic-text uppercase tracking-wide">
                    {SECTION_LABELS[section]}
                  </span>
                  {isOpen ? <ChevronUp size={13} className="text-nordic-text-muted" /> : <ChevronDown size={13} className="text-nordic-text-muted" />}
                </button>

                {isOpen && (
                  <div className="px-5 pb-4 space-y-1.5">
                    {section === 'summary' && c.summary.map((s, i) => (
                      <p key={i} className="text-sm text-nordic-text flex gap-2"><span className="text-nordic-accent shrink-0">—</span>{s}</p>
                    ))}

                    {section === 'key_facts' && c.key_facts.map((f, i) => (
                      <div key={i} className="text-sm">
                        <span className="text-nordic-text">{f.fact}</span>
                        <span className="text-xs text-nordic-text-muted ml-2">({f.source_ref})</span>
                      </div>
                    ))}

                    {section === 'use_cases' && c.use_cases.map((u, i) => (
                      <div key={i} className="text-sm">
                        <p className="text-nordic-text">{u.case}</p>
                        <p className="text-xs text-nordic-text-muted">{u.value} · {u.source_ref}</p>
                      </div>
                    ))}

                    {section === 'narrative' && (
                      <div className="space-y-2">
                        <p className="text-sm text-nordic-text"><span className="font-medium">Rød tråd:</span> {c.narrative.red_thread}</p>
                        <p className="text-sm text-nordic-text"><span className="font-medium">Hovedbudskap:</span> {c.narrative.main_message}</p>
                        {c.narrative.support_messages?.map((m, i) => (
                          <p key={i} className="text-sm text-nordic-text flex gap-2"><span className="text-nordic-text-muted shrink-0">·</span>{m}</p>
                        ))}
                      </div>
                    )}

                    {section === 'examples' && c.examples.map((e, i) => (
                      <div key={i} className="text-sm">
                        <p className="text-nordic-text">{e.example}</p>
                        <p className="text-xs text-nordic-text-muted">{e.relevance} · {e.source_ref}</p>
                      </div>
                    ))}

                    {section === 'risks' && c.risks.map((r, i) => (
                      <div key={i} className="text-sm flex gap-2">
                        <span className="text-nordic-text flex-1">{r.risk} — {r.reason}</span>
                        {r.ks_required && <KSBadge />}
                      </div>
                    ))}

                    {section === 'safe_phrases' && c.safe_phrases.map((p, i) => (
                      <p key={i} className="text-sm text-nordic-text italic border-l-2 border-nordic-accent pl-3">{p}</p>
                    ))}

                    {section === 'source_references' && Object.entries(c.source_references).map(([sec, ref]) => (
                      <div key={sec} className="text-sm flex gap-2">
                        <span className="font-medium text-nordic-text shrink-0">{sec}:</span>
                        <span className="text-nordic-text-muted">{ref}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {open && doc.status === 'generating' && (
        <div className="border-t border-nordic-border px-5 py-8 text-center">
          <p className="text-sm text-nordic-text-muted animate-pulse">Claude analyserer kilden…</p>
        </div>
      )}

      {open && doc.status === 'error' && (
        <div className="border-t border-nordic-border px-5 py-4">
          <p className="text-sm text-red-600">Uttrekk feilet for denne kilden.</p>
        </div>
      )}
    </div>
  );
}
