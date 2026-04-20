import { useEffect, useRef, useState } from 'react';
import { Link, Paperclip, X, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { fetchUrl, parsePdf } from '../lib/edge-functions';
import type { Source } from '../lib/types';
import SourceStatus from './SourceStatus';

interface Props {
  runId: string;
  sources: Source[];
  onSourcesChange: (sources: Source[]) => void;
}

const MAX_PDF_BYTES = 10 * 1024 * 1024;

export default function SourceInput({ runId, sources, onSourcesChange }: Props) {
  const [urlInput, setUrlInput] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refreshSources = async () => {
    const { data } = await supabase
      .schema('infohub')
      .from('sources')
      .select('*')
      .eq('run_id', runId)
      .order('created_at', { ascending: true });
    if (data) onSourcesChange(data as Source[]);
  };

  useEffect(() => {
    const hasProcessing = sources.some(s => s.status === 'processing' || s.status === 'pending');
    if (hasProcessing) {
      if (!pollRef.current) {
        pollRef.current = setInterval(refreshSources, 2000);
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
  }, [sources]);

  const addUrl = async () => {
    const url = urlInput.trim();
    if (!url) return;
    setUrlError(null);
    setAdding(true);
    try {
      const { data: source, error } = await supabase
        .schema('infohub')
        .from('sources')
        .insert({ run_id: runId, type: 'url', url, status: 'processing', title: url })
        .select()
        .single();
      if (error) throw error;
      onSourcesChange([...sources, source as Source]);
      setUrlInput('');
      fetchUrl(source.id, url).then(refreshSources).catch(refreshSources);
    } catch (err) {
      setUrlError(err instanceof Error ? err.message : 'Kunne ikke legge til URL');
    } finally {
      setAdding(false);
    }
  };

  const handleFiles = async (files: FileList) => {
    for (const file of Array.from(files)) {
      if (file.size > MAX_PDF_BYTES) {
        alert(`${file.name} er for stor (maks 10 MB).`);
        continue;
      }
      const pdfPath = `${runId}/${file.name}`;
      try {
        await supabase.storage.from('infohub-sources').upload(pdfPath, file, { upsert: true });
        const { data: source, error } = await supabase
          .schema('infohub')
          .from('sources')
          .insert({ run_id: runId, type: 'pdf', pdf_path: pdfPath, status: 'processing', title: file.name })
          .select()
          .single();
        if (error) throw error;
        onSourcesChange([...sources, source as Source]);
        parsePdf(source.id, pdfPath).then(refreshSources).catch(refreshSources);
      } catch (err) {
        console.error('PDF upload failed:', err);
      }
    }
  };

  const removeSource = async (id: string) => {
    await supabase.schema('infohub').from('sources').delete().eq('id', id);
    onSourcesChange(sources.filter(s => s.id !== id));
  };

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-nordic-text mb-1.5">Legg til URL</label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Link size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-nordic-text-muted" />
              <input
                type="url"
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addUrl()}
                placeholder="https://..."
                className="w-full border border-nordic-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-nordic-text bg-nordic-surface focus:outline-none focus:border-nordic-blue"
              />
            </div>
            <button
              onClick={addUrl}
              disabled={!urlInput.trim() || adding}
              className="px-4 py-2.5 bg-nordic-blue text-white text-sm font-medium rounded-xl hover:bg-nordic-blue/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Legg til
            </button>
          </div>
          {urlError && (
            <p className="flex items-center gap-1.5 mt-1.5 text-xs text-red-600">
              <AlertCircle size={12} />{urlError}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-nordic-text mb-1.5">Last opp PDF</label>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-nordic-border rounded-xl text-sm text-nordic-text-muted hover:border-nordic-blue hover:text-nordic-blue transition-colors w-full justify-center"
          >
            <Paperclip size={14} />Velg PDF-filer (maks 10 MB per fil)
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf"
            multiple
            className="hidden"
            onChange={e => e.target.files && handleFiles(e.target.files)}
          />
        </div>
      </div>

      {sources.length > 0 && (
        <div className="space-y-2">
          {sources.map(s => (
            <div key={s.id} className="flex items-center justify-between p-3 bg-nordic-surface border border-nordic-border rounded-xl gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-nordic-text truncate">{s.title ?? s.url ?? s.pdf_path}</p>
                <p className="text-[10px] text-nordic-text-muted mt-0.5">{s.type === 'url' ? 'URL' : 'PDF'}</p>
              </div>
              <SourceStatus status={s.status} />
              {(s.status === 'pending' || s.status === 'error') && (
                <button onClick={() => removeSource(s.id)} className="p-1 text-nordic-text-muted hover:text-red-500 transition-colors">
                  <X size={13} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
