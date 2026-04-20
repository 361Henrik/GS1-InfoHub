import type { SourceStatus as SourceStatusType } from '../lib/types';

interface Props {
  status: SourceStatusType;
}

const config: Record<SourceStatusType, { label: string; className: string }> = {
  pending: { label: 'Venter', className: 'bg-gray-100 text-nordic-text-muted' },
  processing: { label: 'Henter...', className: 'bg-nordic-blue-light text-nordic-blue animate-pulse' },
  done: { label: 'Klar', className: 'bg-nordic-green-light text-nordic-green' },
  error: { label: 'Feil', className: 'bg-red-50 text-red-600' },
};

export default function SourceStatus({ status }: Props) {
  const { label, className } = config[status];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}
