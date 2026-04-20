import { useEffect, useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Run, Source } from '../lib/types';
import RunCard from '../components/RunCard';

type StatusFilter = 'alle' | Run['status'];

export default function Library() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [sourceCounts, setSourceCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('alle');

  useEffect(() => {
    const load = async () => {
      const { data: runData } = await supabase
        .schema('infohub')
        .from('runs')
        .select('*')
        .order('created_at', { ascending: false });

      if (runData) {
        setRuns(runData as Run[]);
        const ids = runData.map((r: Run) => r.id);
        if (ids.length > 0) {
          const { data: srcData } = await supabase
            .schema('infohub')
            .from('sources')
            .select('run_id')
            .in('run_id', ids);
          if (srcData) {
            const counts: Record<string, number> = {};
            (srcData as Pick<Source, 'run_id'>[]).forEach(s => {
              counts[s.run_id] = (counts[s.run_id] ?? 0) + 1;
            });
            setSourceCounts(counts);
          }
        }
      }
      setLoading(false);
    };
    load();
  }, []);

  const filtered = runs.filter(r => {
    const matchesQuery = r.title.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = statusFilter === 'alle' || r.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif text-nordic-blue">InfoHub</h1>
          <p className="text-sm text-nordic-text-muted mt-1">Alle research-kjøringer</p>
        </div>
        <a
          href="#/ny"
          className="flex items-center gap-2 px-4 py-2.5 bg-nordic-blue text-white text-sm font-medium rounded-xl hover:bg-nordic-blue/90 transition-colors"
        >
          <Plus size={14} />Ny kjøring
        </a>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-nordic-text-muted" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Søk etter kjøring..."
            className="w-full border border-nordic-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-nordic-text bg-nordic-surface focus:outline-none focus:border-nordic-blue"
          />
        </div>
        <div className="flex gap-1.5">
          {(['alle', 'draft', 'running', 'completed'] as const).map(s => {
            const labels: Record<typeof s, string> = { alle: 'Alle', draft: 'Utkast', running: 'Kjører', completed: 'Fullført' };
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-2 text-xs rounded-xl border transition-colors ${
                  statusFilter === s
                    ? 'border-nordic-blue bg-nordic-blue-light text-nordic-blue font-medium'
                    : 'border-nordic-border text-nordic-text-muted hover:border-nordic-blue hover:text-nordic-blue'
                }`}
              >
                {labels[s]}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-20 bg-nordic-border/30 rounded-xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-sm text-nordic-text-muted">
            {runs.length === 0 ? 'Ingen kjøringer ennå. Start med å lage en ny.' : 'Ingen treff.'}
          </p>
          {runs.length === 0 && (
            <a href="#/ny" className="inline-flex items-center gap-2 mt-4 text-sm text-nordic-blue hover:underline">
              <Plus size={13} />Lag din første kjøring
            </a>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(run => (
            <RunCard key={run.id} run={run} sourceCount={sourceCounts[run.id] ?? 0} />
          ))}
        </div>
      )}
    </div>
  );
}
