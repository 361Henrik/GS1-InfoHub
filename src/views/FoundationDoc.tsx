import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Save, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Run, FoundationDocument, FoundationContent } from '../lib/types';
import KSBadge from '../components/KSBadge';
import DocxExportButton from '../components/DocxExportButton';
import { exportFoundationDocument } from '../lib/docx-export';

interface Props {
  runId: string;
}

export default function FoundationDoc({ runId }: Props) {
  const [run, setRun] = useState<Run | null>(null);
  const [doc, setDoc] = useState<FoundationDocument | null>(null);
  const [content, setContent] = useState<FoundationContent | null>(null);
  const [userNotes, setUserNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [approving, setApproving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    Promise.all([
      supabase.schema('infohub').from('runs').select('*').eq('id', runId).single(),
      supabase.schema('infohub').from('foundation_documents').select('*').eq('run_id', runId).single(),
    ]).then(([runRes, docRes]) => {
      if (runRes.data) setRun(runRes.data as Run);
      if (docRes.data) {
        const d = docRes.data as FoundationDocument;
        setDoc(d);
        setContent(d.content);
        setUserNotes(d.user_notes ?? '');
      }
      setLoading(false);
    });
  }, [runId]);

  const save = useCallback(async (c: FoundationContent | null, notes: string) => {
    if (!doc) return;
    setSaving(true);
    await supabase
      .schema('infohub')
      .from('foundation_documents')
      .update({ content: c, user_notes: notes || null })
      .eq('id', doc.id);
    setSaving(false);
    setSavedAt(new Date());
  }, [doc]);

  const scheduleAutosave = (c: FoundationContent | null, notes: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => save(c, notes), 2000);
  };

  const updateContent = (patch: Partial<FoundationContent>) => {
    const next = { ...content, ...patch } as FoundationContent;
    setContent(next);
    scheduleAutosave(next, userNotes);
  };

  const updateNotes = (val: string) => {
    setUserNotes(val);
    scheduleAutosave(content, val);
  };

  const handleSave = async () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    await save(content, userNotes);
  };

  const handleApprove = async () => {
    if (!doc || !window.confirm('Merk dette grunnlagsdokumentet som godkjent?')) return;
    setApproving(true);
    await handleSave();
    await supabase.schema('infohub').from('foundation_documents').update({ status: 'approved' }).eq('id', doc.id);
    setDoc(prev => prev ? { ...prev, status: 'approved' } : prev);
    setApproving(false);
  };

  const handleExport = async () => {
    if (!run || !doc) return;
    setExporting(true);
    await exportFoundationDocument(run, { ...doc, content, user_notes: userNotes });
    setExporting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={24} className="text-nordic-text-muted animate-spin" />
      </div>
    );
  }

  if (!doc || !content) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12 text-center">
        <p className="text-sm text-nordic-text-muted">Grunnlagsdokument ikke funnet.</p>
        <a href={`#/kjoring/${runId}`} className="text-nordic-blue text-sm hover:underline mt-2 inline-block">Tilbake til kjøring</a>
      </div>
    );
  }

  const inputCls = 'w-full border border-nordic-border rounded-xl px-4 py-3 text-sm text-nordic-text bg-nordic-surface focus:outline-none focus:border-nordic-blue resize-none';
  const sectionHeadingCls = 'text-xs font-semibold text-nordic-text uppercase tracking-wide mb-3';

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex items-center gap-3 mb-2">
        <a href={`#/kjoring/${runId}`} className="p-2 text-nordic-text-muted hover:text-nordic-blue transition-colors rounded-lg hover:bg-nordic-bg">
          <ArrowLeft size={18} />
        </a>
        <div className="flex-1">
          <h1 className="text-xl font-serif text-nordic-blue">Grunnlagsdokument</h1>
          <p className="text-xs text-nordic-text-muted mt-0.5">{run?.title}</p>
        </div>
        <div className="flex items-center gap-2">
          {savedAt && !saving && (
            <span className="text-xs text-nordic-text-muted">
              Lagret {savedAt.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          {saving && <Loader2 size={14} className="text-nordic-text-muted animate-spin" />}
          <DocxExportButton onClick={handleExport} loading={exporting} />
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-nordic-border rounded-lg text-nordic-text-muted hover:border-nordic-blue hover:text-nordic-blue transition-colors disabled:opacity-50"
          >
            <Save size={12} />Lagre
          </button>
          {doc.status !== 'approved' && (
            <button
              onClick={handleApprove}
              disabled={approving}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-nordic-green text-white rounded-lg hover:bg-nordic-green/90 transition-colors disabled:opacity-50"
            >
              <CheckCircle size={12} />Merk som godkjent
            </button>
          )}
          {doc.status === 'approved' && (
            <span className="text-xs text-nordic-green font-medium flex items-center gap-1">
              <CheckCircle size={12} />Godkjent
            </span>
          )}
        </div>
      </div>

      <div className="mt-8 space-y-8">
        <section>
          <p className={sectionHeadingCls}>Formål og målgruppe</p>
          <textarea
            value={content.purpose_audience ?? ''}
            onChange={e => updateContent({ purpose_audience: e.target.value })}
            rows={3}
            className={inputCls}
          />
        </section>

        <section>
          <p className={sectionHeadingCls}>Nøkkelfakta</p>
          <div className="space-y-2">
            {(content.key_facts ?? []).map((f, i) => (
              <div key={i} className="flex gap-2">
                <textarea
                  value={f.fact}
                  onChange={e => {
                    const next = [...content.key_facts];
                    next[i] = { ...next[i], fact: e.target.value };
                    updateContent({ key_facts: next });
                  }}
                  rows={2}
                  placeholder="Fakta"
                  className={`flex-1 ${inputCls}`}
                />
                <input
                  type="text"
                  value={f.source}
                  onChange={e => {
                    const next = [...content.key_facts];
                    next[i] = { ...next[i], source: e.target.value };
                    updateContent({ key_facts: next });
                  }}
                  placeholder="Kilde"
                  className="w-32 border border-nordic-border rounded-xl px-3 py-2 text-sm text-nordic-text bg-nordic-surface focus:outline-none focus:border-nordic-blue"
                />
              </div>
            ))}
          </div>
        </section>

        <section>
          <p className={sectionHeadingCls}>Brukstilfeller</p>
          <div className="space-y-2">
            {(content.use_cases ?? []).map((u, i) => (
              <div key={i} className="border border-nordic-border rounded-xl p-3 space-y-2">
                <textarea value={u.case} onChange={e => { const n=[...content.use_cases]; n[i]={...n[i],case:e.target.value}; updateContent({use_cases:n}); }} rows={2} placeholder="Brukstilfelle" className={inputCls} />
                <input type="text" value={u.value} onChange={e => { const n=[...content.use_cases]; n[i]={...n[i],value:e.target.value}; updateContent({use_cases:n}); }} placeholder="Verdi for bruker" className={`${inputCls} py-2`} />
                <input type="text" value={u.gs1_role} onChange={e => { const n=[...content.use_cases]; n[i]={...n[i],gs1_role:e.target.value}; updateContent({use_cases:n}); }} placeholder="GS1s rolle" className={`${inputCls} py-2`} />
              </div>
            ))}
          </div>
        </section>

        <section>
          <p className={sectionHeadingCls}>Budskapslinje</p>
          <div className="space-y-2">
            <textarea value={content.narrative?.red_thread ?? ''} onChange={e => updateContent({ narrative: { ...content.narrative!, red_thread: e.target.value } })} rows={2} placeholder="Rød tråd" className={inputCls} />
            <textarea value={content.narrative?.recommended_angle ?? ''} onChange={e => updateContent({ narrative: { ...content.narrative!, recommended_angle: e.target.value } })} rows={2} placeholder="Anbefalt vinkling" className={inputCls} />
            <div className="space-y-1">
              {(content.narrative?.support_points ?? []).map((p, i) => (
                <textarea key={i} value={p} onChange={e => { const n=[...(content.narrative?.support_points??[])]; n[i]=e.target.value; updateContent({narrative:{...content.narrative!,support_points:n}}); }} rows={1} placeholder={`Støttepunkt ${i+1}`} className={inputCls} />
              ))}
            </div>
          </div>
        </section>

        <section>
          <p className={sectionHeadingCls}>Risiko og forbehold</p>
          <div className="space-y-2">
            {(content.risks ?? []).map((r, i) => (
              <div key={i} className="border border-nordic-border rounded-xl p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <textarea value={r.statement} onChange={e => { const n=[...content.risks]; n[i]={...n[i],statement:e.target.value}; updateContent({risks:n}); }} rows={2} placeholder="Påstand" className={`flex-1 ${inputCls}`} />
                  {r.ks_required && <KSBadge />}
                </div>
                <input type="text" value={r.concern} onChange={e => { const n=[...content.risks]; n[i]={...n[i],concern:e.target.value}; updateContent({risks:n}); }} placeholder="Bekymring / KS-grunn" className={`${inputCls} py-2`} />
              </div>
            ))}
          </div>
        </section>

        <section>
          <p className={sectionHeadingCls}>Begrepsordliste</p>
          <div className="space-y-2">
            {(content.glossary ?? []).map((g, i) => (
              <div key={i} className="flex gap-2">
                <input type="text" value={g.term} onChange={e => { const n=[...content.glossary]; n[i]={...n[i],term:e.target.value}; updateContent({glossary:n}); }} placeholder="Begrep" className="w-40 border border-nordic-border rounded-xl px-3 py-2 text-sm text-nordic-text bg-nordic-surface focus:outline-none focus:border-nordic-blue" />
                <input type="text" value={g.definition} onChange={e => { const n=[...content.glossary]; n[i]={...n[i],definition:e.target.value}; updateContent({glossary:n}); }} placeholder="Definisjon" className={`flex-1 ${inputCls} py-2`} />
              </div>
            ))}
          </div>
        </section>

        <section>
          <p className={sectionHeadingCls}>Kilder</p>
          <div className="space-y-1">
            {(content.sources ?? []).map((s, i) => (
              <div key={i} className="flex gap-2">
                <input type="text" value={s.title} onChange={e => { const n=[...content.sources]; n[i]={...n[i],title:e.target.value}; updateContent({sources:n}); }} placeholder="Tittel" className="w-48 border border-nordic-border rounded-xl px-3 py-2 text-sm text-nordic-text bg-nordic-surface focus:outline-none focus:border-nordic-blue" />
                <input type="text" value={s.url_or_name} onChange={e => { const n=[...content.sources]; n[i]={...n[i],url_or_name:e.target.value}; updateContent({sources:n}); }} placeholder="URL eller navn" className={`flex-1 ${inputCls} py-2`} />
              </div>
            ))}
          </div>
        </section>

        <section>
          <p className={sectionHeadingCls}>Redaktørnotater</p>
          <textarea
            value={userNotes}
            onChange={e => updateNotes(e.target.value)}
            rows={4}
            placeholder="Egne notater, justeringer eller kontekst som ikke kom frem i uttrekket..."
            className={inputCls}
          />
        </section>
      </div>
    </div>
  );
}
