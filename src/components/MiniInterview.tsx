import type { OutputType, DesiredEffect, OutputFormat } from '../lib/types';

export interface MiniInterviewValues {
  output_type: OutputType;
  desired_effect: DesiredEffect;
  audience_level: string;
  scope_limits: string;
  output_format: OutputFormat;
}

interface Props {
  values: MiniInterviewValues;
  onChange: (values: MiniInterviewValues) => void;
}

const OUTPUT_OPTIONS: { value: OutputType; label: string }[] = [
  { value: 'artikkel', label: 'Artikkel' },
  { value: 'webinar', label: 'Webinar' },
  { value: 'linkedin', label: 'LinkedIn-innlegg' },
  { value: 'nyhetsbrev', label: 'Nyhetsbrev' },
  { value: 'intern', label: 'Intern orientering' },
];

const EFFECT_OPTIONS: { value: DesiredEffect; label: string; desc: string }[] = [
  { value: 'forstaelse', label: 'Forståelse', desc: 'Leseren skal forstå et tema bedre' },
  { value: 'handling', label: 'Handling', desc: 'Leseren skal gjøre noe konkret' },
  { value: 'prioritering', label: 'Prioritering', desc: 'Leseren skal omprioritere noe' },
  { value: 'beslutning', label: 'Beslutning', desc: 'Leseren skal ta en beslutning' },
];

const FORMAT_OPTIONS: { value: OutputFormat; label: string; desc: string }[] = [
  { value: 'kort', label: 'Kort', desc: '1-side oversikt per kilde' },
  { value: 'standard', label: 'Standard', desc: 'Strukturerte innsiktsdokumenter' },
  { value: 'dyp', label: 'Dyp', desc: 'Flere detaljer og kildehenvisninger' },
];

export default function MiniInterview({ values, onChange }: Props) {
  const set = <K extends keyof MiniInterviewValues>(key: K, val: MiniInterviewValues[K]) =>
    onChange({ ...values, [key]: val });

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-xs font-medium text-nordic-text mb-1.5">Ønsket output-type</label>
        <select
          value={values.output_type}
          onChange={e => set('output_type', e.target.value as OutputType)}
          className="w-full border border-nordic-border rounded-xl px-4 py-3 text-sm text-nordic-text bg-nordic-surface focus:outline-none focus:border-nordic-blue"
        >
          {OUTPUT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-nordic-text mb-2">Ønsket effekt</label>
        <div className="grid grid-cols-2 gap-2">
          {EFFECT_OPTIONS.map(e => (
            <label
              key={e.value}
              className={`flex items-start gap-3 p-3 border rounded-xl cursor-pointer transition-colors ${
                values.desired_effect === e.value
                  ? 'border-nordic-blue bg-nordic-blue-light'
                  : 'border-nordic-border hover:border-nordic-blue/50'
              }`}
            >
              <input
                type="radio"
                name="desired_effect"
                value={e.value}
                checked={values.desired_effect === e.value}
                onChange={() => set('desired_effect', e.value)}
                className="mt-0.5 accent-nordic-blue"
              />
              <div>
                <p className="text-xs font-medium text-nordic-text">{e.label}</p>
                <p className="text-[11px] text-nordic-text-muted">{e.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-nordic-text mb-1.5">Hvem skal forstå dette</label>
        <input
          type="text"
          value={values.audience_level}
          onChange={e => set('audience_level', e.target.value)}
          placeholder="Målgruppe + kunnskapsnivå (f.eks. «Logistikksjefer, ikke-teknisk bakgrunn»)"
          className="w-full border border-nordic-border rounded-xl px-4 py-3 text-sm text-nordic-text bg-nordic-surface focus:outline-none focus:border-nordic-blue"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-nordic-text mb-1.5">Hva skal IKKE hentes ut</label>
        <textarea
          value={values.scope_limits}
          onChange={e => set('scope_limits', e.target.value)}
          rows={3}
          placeholder="Temaer som er utenfor scope, termer som bør unngås, påstander som krever ekstra KS..."
          className="w-full border border-nordic-border rounded-xl px-4 py-3 text-sm text-nordic-text bg-nordic-surface focus:outline-none focus:border-nordic-blue resize-none"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-nordic-text mb-2">Output-format</label>
        <div className="grid grid-cols-3 gap-2">
          {FORMAT_OPTIONS.map(f => (
            <label
              key={f.value}
              className={`flex flex-col items-center p-3 border rounded-xl cursor-pointer transition-colors text-center ${
                values.output_format === f.value
                  ? 'border-nordic-blue bg-nordic-blue-light'
                  : 'border-nordic-border hover:border-nordic-blue/50'
              }`}
            >
              <input
                type="radio"
                name="output_format"
                value={f.value}
                checked={values.output_format === f.value}
                onChange={() => set('output_format', f.value)}
                className="sr-only"
              />
              <p className="text-sm font-medium text-nordic-text">{f.label}</p>
              <p className="text-[10px] text-nordic-text-muted mt-0.5">{f.desc}</p>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
