import DemoBanner from './DemoBanner';

interface Props {
  children: React.ReactNode;
}

export default function Layout({ children }: Props) {
  return (
    <div className="min-h-screen bg-nordic-bg font-sans">
      <DemoBanner />
      <header className="bg-nordic-surface border-b border-nordic-border px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href="#/" className="flex items-center gap-3">
            <span className="text-nordic-blue font-serif italic text-xl border-b-2 border-nordic-accent">GS1</span>
            <span className="text-[10px] tracking-widest uppercase text-nordic-text-muted">Norway</span>
          </a>
          <span className="text-nordic-border mx-2">|</span>
          <span className="text-sm font-medium text-nordic-text">InfoHub</span>
        </div>
        <span className="text-xs text-nordic-text-muted hidden md:block">infohub.gs1.threesix1.com</span>
      </header>
      <main>{children}</main>
    </div>
  );
}
