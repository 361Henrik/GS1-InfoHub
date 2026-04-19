import { useState } from 'react';
import { Search, BookOpen, Tag, ChevronRight } from 'lucide-react';

const PLACEHOLDER_ARTICLES = [
  { title: 'Kom i gang med GTIN', category: 'Standarder', desc: 'Slik tildeler du GTIN riktig for dine produkter i dagligvare og faghandel.' },
  { title: 'GS1-128 strekkode: komplett guide', category: 'Strekkoder', desc: 'Alt du trenger å vite om GS1-128-format, Application Identifiers og bruksområder.' },
  { title: 'EDI og ORDERS-meldinger', category: 'EDI', desc: 'Sett opp elektronisk ordrebehandling med GS1-godkjente meldingsformater.' },
  { title: 'Bærekraft og produktdata', category: 'Bærekraft', desc: 'Hvordan strukturerte produktdata støtter ESG-rapportering og sirkulærøkonomi.' },
  { title: 'GS1 Digital Link forklart', category: 'Digital Link', desc: 'Få 2D-strekkoder til å låse opp rik produktinformasjon for forbrukere og kjøder.' },
  { title: 'SSCC og logistikketiketter', category: 'Logistikk', desc: 'Merk paller og kolli korrekt med Serial Shipping Container Code.' },
];

const CATEGORIES = ['Alle', 'Standarder', 'Strekkoder', 'EDI', 'Bærekraft', 'Digital Link', 'Logistikk'];

export default function App() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Alle');

  const filtered = PLACEHOLDER_ARTICLES.filter(a => {
    const matchesQuery = a.title.toLowerCase().includes(query.toLowerCase()) || a.desc.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = activeCategory === 'Alle' || a.category === activeCategory;
    return matchesQuery && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-nordic-bg font-sans">
      <header className="bg-nordic-surface border-b border-nordic-border px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-nordic-blue font-serif italic text-xl border-b-2 border-nordic-accent">GS1</span>
          <span className="text-[10px] tracking-widest uppercase text-nordic-text-muted">Norway</span>
          <span className="text-nordic-border mx-2">|</span>
          <span className="text-sm font-medium text-nordic-text">InfoHub</span>
        </div>
        <span className="text-xs text-nordic-text-muted hidden md:block">infohub.gs1.threesix1.com</span>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={16} className="text-nordic-accent" />
            <span className="text-xs font-medium uppercase tracking-widest text-nordic-accent">Søkbar kunnskapsbase</span>
          </div>
          <h1 className="text-4xl font-serif text-nordic-blue mb-4">InfoHub</h1>
          <p className="text-lg text-nordic-text-muted">GS1-standarder, veiledere og caser samlet på étt sted.</p>
        </div>

        <div className="relative mb-6">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-nordic-text-muted" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Søk i kunnskapsbasen..."
            className="w-full border border-nordic-border rounded-xl pl-10 pr-4 py-3 text-sm text-nordic-text bg-nordic-surface focus:outline-none focus:border-nordic-blue"
          />
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border transition-colors ${
                activeCategory === cat
                  ? 'border-nordic-blue bg-nordic-blue-light text-nordic-blue font-medium'
                  : 'border-nordic-border text-nordic-text-muted hover:border-nordic-blue hover:text-nordic-blue'
              }`}
            >
              <Tag size={10} />{cat}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="text-center py-16 text-nordic-text-muted text-sm">Ingen treff. Prøv et annet søkeord.</div>
          )}
          {filtered.map((article, i) => (
            <div key={i} className="bg-nordic-surface border border-nordic-border rounded-xl p-5 flex items-start justify-between gap-4 hover:border-nordic-blue transition-colors cursor-pointer group">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-nordic-accent">{article.category}</span>
                </div>
                <h3 className="text-sm font-medium text-nordic-blue mb-1">{article.title}</h3>
                <p className="text-xs text-nordic-text-muted leading-relaxed">{article.desc}</p>
              </div>
              <ChevronRight size={16} className="text-nordic-border group-hover:text-nordic-blue transition-colors shrink-0 mt-1" />
            </div>
          ))}
        </div>

        <p className="mt-10 text-xs text-nordic-text-muted text-center">
          Kobles mot Supabase — innhold administreres via Publish-appen.
        </p>
      </main>
    </div>
  );
}
