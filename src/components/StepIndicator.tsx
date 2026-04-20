import { Check } from 'lucide-react';

const STEPS = [
  'Velg brief',
  'Legg til kilder',
  'Uttaksprofiler',
  'Presisering',
  'Bekreft og kjør',
];

interface Props {
  currentStep: number; // 1–5
}

export default function StepIndicator({ currentStep }: Props) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((label, i) => {
        const step = i + 1;
        const completed = step < currentStep;
        const active = step === currentStep;

        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-colors ${
                completed
                  ? 'bg-nordic-green border-nordic-green text-white'
                  : active
                  ? 'bg-nordic-blue border-nordic-blue text-white'
                  : 'bg-white border-nordic-border text-nordic-text-muted'
              }`}>
                {completed ? <Check size={12} strokeWidth={3} /> : step}
              </div>
              <span className={`text-[10px] font-medium hidden sm:block ${
                active ? 'text-nordic-blue' : completed ? 'text-nordic-green' : 'text-nordic-text-muted'
              }`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-0.5 flex-1 mx-1 mb-4 transition-colors ${
                completed ? 'bg-nordic-green' : 'bg-nordic-border'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
