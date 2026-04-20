import { FlaskConical } from 'lucide-react';

export default function DemoBanner() {
  return (
    <div className="bg-nordic-accent-light border-b border-nordic-accent/30 px-6 py-2 flex items-center justify-center gap-2">
      <FlaskConical size={13} className="text-nordic-accent shrink-0" />
      <p className="text-xs text-nordic-accent font-medium">
        Demo-modus — alle data er fiktive eksempler. Ingen tilkobling til database eller AI.
      </p>
    </div>
  );
}
