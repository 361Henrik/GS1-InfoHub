import { useEffect, useState } from 'react';
import { Calendar, Users, Radio } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Brief } from '../lib/types';

interface Props {
  onSelect: (brief: Brief) => void;
}

export default function BriefSelector({ onSelect }: Props) {
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .schema('brief')
      .from('briefs')
      .select('id, created_at, topic, audience, channels, generated_brief, status')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .then(({ data, error: err }: { data: Brief[] | null; error: { message: string } | null }) => {
        if (err) setError(err.message);
        else setBriefs((data ?? []) as Brief[]);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 bg-nordic-border/30 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
        Kunne ikke hente briefs: {error}
      </div>
    );
  }

  if (briefs.length === 0) {
    return (
      <div className="p-8 text-center border border-nordic-border rounded-xl">
        <p className="text-sm text-nordic-text-muted">Ingen godkjente briefs funnet.</p>
        <p className="text-xs text-nordic-text-muted mt-1">Godkjenn en brief i Dynamisk Brief for å hente den her.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {briefs.map(brief => (
        <button
          key={brief.id}
          onClick={() => { setSelected(brief.id); onSelect(brief); }}
          className={`w-full text-left p-4 border rounded-xl transition-colors ${
            selected === brief.id
              ? 'border-nordic-blue bg-nordic-blue-light'
              : 'border-nordic-border bg-nordic-surface hover:border-nordic-blue'
          }`}
        >
          <p className="text-sm font-medium text-nordic-blue mb-1.5">{brief.topic}</p>
          <div className="flex items-center gap-4 text-xs text-nordic-text-muted">
            <span className="flex items-center gap-1"><Users size={11} />{brief.audience}</span>
            {brief.channels?.length > 0 && (
              <span className="flex items-center gap-1"><Radio size={11} />{brief.channels.join(', ')}</span>
            )}
            <span className="flex items-center gap-1">
              <Calendar size={11} />
              {new Date(brief.created_at).toLocaleDateString('nb-NO')}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}
