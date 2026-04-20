import { Download } from 'lucide-react';

interface Props {
  onClick: () => void;
  loading?: boolean;
  label?: string;
}

export default function DocxExportButton({ onClick, loading = false, label = 'Last ned som Word' }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium border border-nordic-border rounded-lg text-nordic-text-muted hover:border-nordic-blue hover:text-nordic-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Download size={13} />
      {loading ? 'Genererer...' : label}
    </button>
  );
}
