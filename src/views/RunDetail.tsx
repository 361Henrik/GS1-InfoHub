import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, FileText, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Run, Source, InsightDocument, InsightSummary, FoundationDocument, SummaryContent } from '../lib/types';
import InsightDocCard from '../components/InsightDocCard';
import DocxExportButton from '../components/DocxExportButton';
import { summarizeInsights, buildFoundation } from '../lib/edge-functions';
import { exportFoundationDocument } from '../lib/docx-export';

interface Props {
  runId: string;
}

export default function RunDetail({ runId }: Props) {
  const [run, setRun] = useState<Run | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [insightDocs, setInsightDocs] = useState<InsightDocument[]>([]);
  const [summary, setSummary] = useState<InsightSummary | null>(null);
  const [foundation, setFoundation] = useState<FoundationDocument | null>(null);
  const [loading, setLoading] = useState(true);

  const [summarizing, setSummarizing] = useState(false);
  const [buildingFoundation, setBuildingFoundation] = useState(false);
  const [exportingFoundation, setExportingFoundation] = useState(false);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchAll = async () => {
    const [runRes, sourcesRes, docsRes, summaryRes, foundationRes] = await Promise.all([
      supabase.schema('infohub').from('runs').select('*').eq('id', runId).single(),
      supabase.schema('infohub').from('sources').select('*').eq('run_id', runId).order('created_at'),
      supabase.schema('infohub').from('insight_documents').select('*').eq('run_id', runId),
      supabase.schema('infohub').from('insight_summaries').select('*').eq('run_id', runId).maybeSingle(),
      supabase.schema('infohub').from('foundation_documents').select('*').eq('run_id', runId).maybeSingle(),
    ]);
    if (runRes.data) setRun(runRes.data as Run);
    if (sourcesRes.data) setSources(sourcesRes.data as Source[]);
    if (docsRes.data) setInsightDocs(docsRes.data as InsightDocument[]);
    if (summaryRes.data) setSummary(summaryRes.data as InsightSummary);
    if (foundationRes.data) setFoundation(foundationRes.data as FoundationDocument);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runId]);

  useEffect(() => {
    const hasGenerating = insightDocs.some(d => d.status === 'generating' || d.status === 'pending');
    const summaryGenerating = summary?.status === 'generating';
    const foundationGenerating = buildingFoundation;

    if (hasGenerating || summaryGenerating || foundationGenerating) {
      if (!pollRef.current) {
        pollRef.current = setInterval(fetchAll, 2000);
      }
    } else {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [insightDocs, summary, foundation]);

  const allDocsDone = insightDocs.length > 0 && insightDocs.every(d => d.status === 'done' || d.status === 'error');
  const summaryDone = summary?.status === 'done';

  const handleSummarize = async () => {
    setSummarizing(true);
    try {
      await summarizeInsights(runId);
      await fetchAll();
    } catch (err) {
      console.error(err);
    } finally {
      setSummarizing(false);
    }
  };

  const handleBuildFoundation = async () => {
    setBuildingFoundation(true);
    try {
      await buildFoundation(runId);
      await fetchAll();
    } catch (err) {
      console.error(err);
    } finally {
      setBuildingFoundation(false);
    }
  };

  const handleExportFoundation = async () => {
    if (!run || !foundation) return;
    setExportingFoundation(true);
    try {
      await exportFoundationDocument(run, foundation);
    } finally {
      setExportingFoundation(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={24} className="text-nordic-text-muted animate-spin" />
      </div>
    );
  }

  if (!run) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12 text-center">
        <p className="text-sm text-nordic-text-muted">Kjøring ikke funnet.</p>
        <a href="#/" className="text-nordic-blue text-sm hover:underline mt-2 inline-block">Gå tilbake</a>
      </div>
    );
  }

  const sourceMap = Object.fromEntries(sources.map(s => [s.id, s]));
  const summaryContent = summary?.content as SummaryContent | null;

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex items-center gap-3 mb-8">
        <a href="#/" className="p-2 text-nordic-text-muted hover:text-nordic-blue transition-colors rounded-lg hover:bg-nordic-bg">
          <ArrowLeft size={18} />
        </a>
        <div>
          <h1 className="text-xl font-serif text-nordic-blue">{run.title}</h1>
          <p className="text-xs text-nordic-text-muted mt-0.5">
            {new Date(run.created_at).toLocaleDateString('nb-NO')} · {sources.length} kilder
          </p>
        </div>
      </div>

      {/* Step 6 — Innsiktsdokumenter */}
      <section className="mb-10">
        <h2 className="text-base font-semibold text-nordic-text mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-nordic-blue text-white text-xs flex items-center justify-center font-bold">6</span>
          Innsiktsdokumenter
        </h2>
        {insightDocs.length === 0 ? (
          <p className="text-sm text-nordic-text-muted">Ingen innsiktsdokumenter ennå.</p>
        ) : (
          <div className="space-y-3">
            {insightDocs.map(doc => {
              const source = sourceMap[doc.source_id];
              if (!source) return null;
              return <InsightDocCard key={doc.id} source={source} doc={doc} />;
            })}
          </div>
        )}
      </section>

      {/* Step 7 — Innsiktsoppsummering */}
      <section className="mb-10">
        <h2 className="text-base font-semibold text-nordic-text mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-nordic-blue text-white text-xs flex items-center justify-center font-bold">7</span>
          Innsiktsoppsummering
        </h2>

        {!summary && (
          <button
            onClick={handleSummarize}
            disabled={!allDocsDone || summarizing}
            className="flex items-center gap-2 px-4 py-2.5 bg-nordic-blue text-white text-sm font-medium rounded-xl hover:bg-nordic-blue/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {summarizing ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
            {summarizing ? 'Genererer…' : 'Generer innsiktsoppsummering'}
          </button>
        )}

        {summary?.status === 'generating' && (
          <p className="text-sm text-nordic-text-muted animate-pulse">Genererer oppsummering…</p>
        )}

        {summaryDone && summaryContent && (
          <div className="bg-nordic-surface border border-nordic-border rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-nordic-text">Oppsummering på tvers av kilder</h3>
              <DocxExportButton onClick={() => {}} label="Last ned" />
            </div>
            {summaryContent.top_findings?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-nordic-text uppercase tracking-wide mb-2">Toppfunn</p>
                {summaryContent.top_findings.map((f, i) => (
                  <p key={i} className="text-sm text-nordic-text flex gap-2 mb-1"><span className="text-nordic-accent">—</span>{f}</p>
                ))}
              </div>
            )}
            {summaryContent.red_thread?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-nordic-text uppercase tracking-wide mb-2">Rød tråd</p>
                {summaryContent.red_thread.map((t, i) => (
                  <p key={i} className="text-sm text-nordic-text flex gap-2 mb-1"><span className="text-nordic-text-muted">·</span>{t}</p>
                ))}
              </div>
            )}
            {summaryContent.quality_checks?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-nordic-accent uppercase tracking-wide mb-2">KS-sjekkliste</p>
                {summaryContent.quality_checks.map((q, i) => (
                  <p key={i} className="text-sm text-nordic-text flex gap-2 mb-1"><span className="text-nordic-accent">⚠</span>{q}</p>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Step 8 — Grunnlagsdokument */}
      <section className="mb-10">
        <h2 className="text-base font-semibold text-nordic-text mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-nordic-blue text-white text-xs flex items-center justify-center font-bold">8</span>
          Grunnlagsdokument
        </h2>

        {!foundation && (
          <button
            onClick={handleBuildFoundation}
            disabled={!summaryDone || buildingFoundation}
            className="flex items-center gap-2 px-4 py-2.5 bg-nordic-blue text-white text-sm font-medium rounded-xl hover:bg-nordic-blue/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {buildingFoundation ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
            {buildingFoundation ? 'Genererer…' : 'Lag grunnlagsdokument'}
          </button>
        )}

        {buildingFoundation && !foundation && (
          <p className="text-sm text-nordic-text-muted animate-pulse">Genererer grunnlagsdokument…</p>
        )}

        {foundation && (
          <div className="bg-nordic-surface border border-nordic-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-nordic-text">
                Grunnlagsdokument
                {foundation.status === 'approved' && (
                  <span className="ml-2 text-xs text-nordic-green font-normal">· Godkjent</span>
                )}
              </h3>
              <div className="flex gap-2">
                <DocxExportButton onClick={handleExportFoundation} loading={exportingFoundation} />
              </div>
            </div>
            <p className="text-sm text-nordic-text-muted mb-3">{foundation.content?.purpose_audience}</p>
            <a
              href={`#/kjoring/${runId}/grunnlag`}
              className="text-xs text-nordic-blue hover:underline"
            >
              Åpne og rediger grunnlagsdokument →
            </a>
          </div>
        )}
      </section>
    </div>
  );
}
