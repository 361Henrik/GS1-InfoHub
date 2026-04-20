import { ChevronRight, FileText, Tag } from 'lucide-react';
import type { Run } from '../lib/types';

interface Props {
  run: Run;
  sourceCount?: number;
}

const STATUS_LABELS: Record<Run['status'], { label: string; className: string }> = {
  draft: { label: 'Utkast', className: 'bg-gray-100 text-nordic-text-muted' },
  running: { label: 'Kjører', className: 'bg-nordic-blue-light text-nordic-blue animate-pulse' },
  completed: { label: 'Fullført', className: 'bg-nordic-green-light text-nordic-green' },
};

export default function RunCard({ run, sourceCount }: Props) {
  const navigate = () => { window.location.hash = `#/kjoring/${run.id}`; };
  const { label, className } = STATUS_LABELS[run.status];

  return (
    <button
      onClick={navigate}
      className="w-full text-left bg-nordic-surface border border-nordic-border rounded-xl p-5 flex items-start justify-between gap-4 hover:border-nordic-blue transition-colors group"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>
            {label}
          </span>
          {run.tags?.length > 0 && (
            <span className="flex items-center gap-1 text-xs text-nordic-text-muted">
              <Tag size={10} />{run.tags.join(', ')}
            </span>
          )}
        </div>
        <p className="text-sm font-medium text-nordic-blue truncate">{run.title}</p>
        <div className="flex items-center gap-3 mt-1.5 text-xs text-nordic-text-muted">
          <span>{new Date(run.created_at).toLocaleDateString('nb-NO')}</span>
          {sourceCount !== undefined && (
            <span className="flex items-center gap-1"><FileText size={10} />{sourceCount} kilder</span>
          )}
        </div>
      </div>
      <ChevronRight size={16} className="text-nordic-border group-hover:text-nordic-blue transition-colors shrink-0 mt-1" />
    </button>
  );
}
