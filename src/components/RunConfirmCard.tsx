import { Play } from 'lucide-react';
import type { Run, Source } from '../lib/types';

interface Props {
  run: Partial<Run>;
  sources: Source[];
  onRun: () => Promise<void>;
  loading: boolean;
}

const FORMAT_LABELS: Record<string, string> = {
  kort: 'Kort (1-side per kilde)',
  standard: 'Standard (strukturerte innsiktsdokumenter)',
  dyp: 'Dyp (flere detaljer og kildehenvisninger)',
};

const PROFILE_LABELS: Record<string, string> = {
  key_facts: 'Nøkkelfakta og hovedpoenger',
  claims_basis: 'Fakta- og påstandsgrunnlag',
  use_cases: 'Brukstilfeller og medlemsverdi',
  narrative: 'Historie og budskapslinje',
  examples: 'Eksempler og illustrasjoner',
  risks: 'Risiko og forbehold',
};

export default function RunConfirmCard({ run, sources, onRun, loading }: Props) {
  const doneSources = sources.filter(s => s.status === 'done');

  return (
    <div className="space-y-6">
      <div className="bg-nordic-surface border border-nordic-border rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-nordic-text">Oppsummering</h3>

        <div className="space-y-3 text-sm">
          <div className="flex gap-2">
            <span className="text-nordic-text-muted w-36 shrink-0">Brief</span>
            <span className="text-nordic-text">{run.title ?? '—'}</span>
          </div>

          <div className="flex gap-2">
            <span className="text-nordic-text-muted w-36 shrink-0">Antall kilder</span>
            <span className="text-nordic-text">{doneSources.length} klar{doneSources.length !== 1 ? 'e' : ''}</span>
          </div>

          <div className="flex gap-2">
            <span className="text-nordic-text-muted w-36 shrink-0">Uttaksprofiler</span>
            <div className="flex flex-wrap gap-1">
              {(run.extraction_profiles ?? []).map(p => (
                <span key={p} className="px-2 py-0.5 bg-nordic-blue-light text-nordic-blue text-xs rounded-full">
                  {PROFILE_LABELS[p] ?? p}
                </span>
              ))}
              {(run.custom_extraction_points ?? []).filter(Boolean).map((p, i) => (
                <span key={i} className="px-2 py-0.5 bg-nordic-accent-light text-nordic-accent text-xs rounded-full">{p}</span>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <span className="text-nordic-text-muted w-36 shrink-0">Output-format</span>
            <span className="text-nordic-text">{FORMAT_LABELS[run.output_format ?? 'standard']}</span>
          </div>

          {run.scope_limits && (
            <div className="flex gap-2">
              <span className="text-nordic-text-muted w-36 shrink-0">Scope-begrensning</span>
              <span className="text-nordic-text">{run.scope_limits}</span>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={onRun}
        disabled={loading || doneSources.length === 0}
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-nordic-blue text-white text-sm font-medium rounded-xl hover:bg-nordic-blue/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Play size={15} />
        {loading ? 'Starter…' : 'Kjør InfoHub'}
      </button>

      {doneSources.length === 0 && (
        <p className="text-xs text-center text-nordic-text-muted">
          Ingen ferdigbehandlede kilder. Gå tilbake og vent til kildene er klare.
        </p>
      )}
    </div>
  );
}
