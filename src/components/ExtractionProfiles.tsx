import { Plus, X } from 'lucide-react';

const STANDARD_PROFILES = [
  { id: 'key_facts', label: 'Nøkkelfakta og hovedpoenger', desc: 'De 5–10 viktigste poengene, definisjoner, tall/krav' },
  { id: 'claims_basis', label: 'Fakta- og påstandsgrunnlag', desc: 'Konkrete påstander med kildehenvisning, hva må KS' },
  { id: 'use_cases', label: 'Brukstilfeller og medlemsverdi', desc: 'Problemet som løses, hvem får verdi, effekter, GS1s rolle' },
  { id: 'narrative', label: 'Historie og budskapslinje', desc: 'Rød tråd, hoved- og støttebudskap, formuleringer/analogier' },
  { id: 'examples', label: 'Eksempler og illustrasjoner', desc: '3–5 konkrete eksempler, case, scenarioer, sitater' },
  { id: 'risks', label: 'Risiko og forbehold', desc: 'Sensitive påstander, usikkerheter, hva bør KS' },
];

interface Props {
  profiles: string[];
  customPoints: string[];
  onChange: (profiles: string[], customPoints: string[]) => void;
}

export default function ExtractionProfiles({ profiles, customPoints, onChange }: Props) {
  const toggleProfile = (id: string) => {
    const next = profiles.includes(id)
      ? profiles.filter(p => p !== id)
      : [...profiles, id];
    onChange(next, customPoints);
  };

  const addCustom = () => onChange(profiles, [...customPoints, '']);

  const updateCustom = (i: number, val: string) => {
    onChange(profiles, customPoints.map((p, idx) => (idx === i ? val : p)));
  };

  const removeCustom = (i: number) => {
    onChange(profiles, customPoints.filter((_, idx) => idx !== i));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {STANDARD_PROFILES.map(p => (
          <label
            key={p.id}
            className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${
              profiles.includes(p.id)
                ? 'border-nordic-blue bg-nordic-blue-light'
                : 'border-nordic-border bg-nordic-surface hover:border-nordic-blue/50'
            }`}
          >
            <input
              type="checkbox"
              checked={profiles.includes(p.id)}
              onChange={() => toggleProfile(p.id)}
              className="mt-0.5 accent-nordic-blue"
            />
            <div>
              <p className="text-sm font-medium text-nordic-text">{p.label}</p>
              <p className="text-xs text-nordic-text-muted mt-0.5">{p.desc}</p>
            </div>
          </label>
        ))}
      </div>

      <div>
        <p className="text-xs font-medium text-nordic-text mb-2">Egne uttakspunkter</p>
        <div className="space-y-2">
          {customPoints.map((pt, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={pt}
                onChange={e => updateCustom(i, e.target.value)}
                placeholder='F.eks. "Finn 3 eksempler for helsesektoren"'
                className="flex-1 border border-nordic-border rounded-xl px-4 py-2.5 text-sm text-nordic-text bg-nordic-surface focus:outline-none focus:border-nordic-blue"
              />
              <button
                type="button"
                onClick={() => removeCustom(i)}
                className="p-2.5 text-nordic-text-muted hover:text-red-500 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addCustom}
            className="flex items-center gap-1.5 text-xs text-nordic-blue hover:text-nordic-blue/70 transition-colors"
          >
            <Plus size={13} />Legg til eget punkt
          </button>
        </div>
      </div>
    </div>
  );
}
