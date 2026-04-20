import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import type { ManualBrief } from '../lib/types';

interface Props {
  onSubmit: (brief: ManualBrief) => void;
}

const OUTPUT_OPTIONS: { value: ManualBrief['planned_output']; label: string }[] = [
  { value: 'artikkel', label: 'Artikkel' },
  { value: 'webinar', label: 'Webinar' },
  { value: 'linkedin', label: 'LinkedIn-innlegg' },
  { value: 'nyhetsbrev', label: 'Nyhetsbrev' },
  { value: 'intern', label: 'Intern orientering' },
];

export default function ManualBriefForm({ onSubmit }: Props) {
  const [goal, setGoal] = useState('');
  const [audience, setAudience] = useState('');
  const [plannedOutput, setPlannedOutput] = useState<ManualBrief['planned_output']>('artikkel');
  const [questions, setQuestions] = useState(['', '', '']);
  const [mustInclude, setMustInclude] = useState('');
  const [mustAvoid, setMustAvoid] = useState('');

  const addQuestion = () => {
    if (questions.length < 7) setQuestions(prev => [...prev, '']);
  };

  const removeQuestion = (i: number) => {
    if (questions.length <= 3) return;
    setQuestions(prev => prev.filter((_, idx) => idx !== i));
  };

  const updateQuestion = (i: number, val: string) => {
    setQuestions(prev => prev.map((q, idx) => (idx === i ? val : q)));
  };

  const canSubmit = goal.trim() && audience.trim() && questions.filter(q => q.trim()).length >= 3;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({
      goal: goal.trim(),
      audience: audience.trim(),
      planned_output: plannedOutput,
      key_questions: questions.filter(q => q.trim()),
      must_include: mustInclude.trim(),
      must_avoid: mustAvoid.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-xs font-medium text-nordic-text mb-1.5">Mål og hensikt *</label>
        <textarea
          value={goal}
          onChange={e => setGoal(e.target.value)}
          rows={3}
          placeholder="Hva ønsker kommunikasjonsteamet å oppnå med dette innholdet?"
          className="w-full border border-nordic-border rounded-xl px-4 py-3 text-sm text-nordic-text bg-nordic-surface focus:outline-none focus:border-nordic-blue resize-none"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-nordic-text mb-1.5">Målgruppe *</label>
        <input
          type="text"
          value={audience}
          onChange={e => setAudience(e.target.value)}
          placeholder="Hvem er innholdet rettet mot?"
          className="w-full border border-nordic-border rounded-xl px-4 py-3 text-sm text-nordic-text bg-nordic-surface focus:outline-none focus:border-nordic-blue"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-nordic-text mb-1.5">Planlagt output</label>
        <select
          value={plannedOutput}
          onChange={e => setPlannedOutput(e.target.value as ManualBrief['planned_output'])}
          className="w-full border border-nordic-border rounded-xl px-4 py-3 text-sm text-nordic-text bg-nordic-surface focus:outline-none focus:border-nordic-blue"
        >
          {OUTPUT_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-nordic-text mb-1.5">
          Nøkkelspørsmål * <span className="text-nordic-text-muted">(minst 3, maks 7)</span>
        </label>
        <div className="space-y-2">
          {questions.map((q, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={q}
                onChange={e => updateQuestion(i, e.target.value)}
                placeholder={`Spørsmål ${i + 1}`}
                className="flex-1 border border-nordic-border rounded-xl px-4 py-2.5 text-sm text-nordic-text bg-nordic-surface focus:outline-none focus:border-nordic-blue"
              />
              {questions.length > 3 && (
                <button
                  type="button"
                  onClick={() => removeQuestion(i)}
                  className="p-2.5 text-nordic-text-muted hover:text-red-500 transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
          {questions.length < 7 && (
            <button
              type="button"
              onClick={addQuestion}
              className="flex items-center gap-1.5 text-xs text-nordic-blue hover:text-nordic-blue/70 transition-colors mt-1"
            >
              <Plus size={13} />Legg til spørsmål
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-nordic-text mb-1.5">Må inkluderes</label>
          <textarea
            value={mustInclude}
            onChange={e => setMustInclude(e.target.value)}
            rows={3}
            placeholder="Temaer, påstander eller fakta som må være med"
            className="w-full border border-nordic-border rounded-xl px-4 py-3 text-sm text-nordic-text bg-nordic-surface focus:outline-none focus:border-nordic-blue resize-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-nordic-text mb-1.5">Skal unngås</label>
          <textarea
            value={mustAvoid}
            onChange={e => setMustAvoid(e.target.value)}
            rows={3}
            placeholder="Temaer, termer eller påstander som ikke skal brukes"
            className="w-full border border-nordic-border rounded-xl px-4 py-3 text-sm text-nordic-text bg-nordic-surface focus:outline-none focus:border-nordic-blue resize-none"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full py-3 bg-nordic-blue text-white text-sm font-medium rounded-xl hover:bg-nordic-blue/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Bekreft kontekst og gå videre
      </button>
    </form>
  );
}
