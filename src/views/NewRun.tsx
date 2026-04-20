import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Brief, Source, OutputType, DesiredEffect, OutputFormat } from '../lib/types';
import StepIndicator from '../components/StepIndicator';
import BriefSelector from '../components/BriefSelector';
import ManualBriefForm from '../components/ManualBriefForm';
import SourceInput from '../components/SourceInput';
import ExtractionProfiles from '../components/ExtractionProfiles';
import MiniInterview, { type MiniInterviewValues } from '../components/MiniInterview';
import RunConfirmCard from '../components/RunConfirmCard';
import { extractInsight } from '../lib/edge-functions';

type BriefMode = 'dynamisk' | 'manuell';

export default function NewRun() {
  const [step, setStep] = useState(1);
  const [briefMode, setBriefMode] = useState<BriefMode>('dynamisk');

  // Step 1 state
  const [runId, setRunId] = useState<string | null>(null);
  const [runTitle, setRunTitle] = useState('');

  // Step 2 state
  const [sources, setSources] = useState<Source[]>([]);

  // Step 3 state
  const [profiles, setProfiles] = useState<string[]>([]);
  const [customPoints, setCustomPoints] = useState<string[]>([]);

  // Step 4 state
  const [interview, setInterview] = useState<MiniInterviewValues>({
    output_type: 'artikkel' as OutputType,
    desired_effect: 'forstaelse' as DesiredEffect,
    audience_level: '',
    scope_limits: '',
    output_format: 'standard' as OutputFormat,
  });

  // Step 5 state
  const [running, setRunning] = useState(false);

  const createRun = async (title: string, briefId?: string, manualBrief?: object) => {
    const { data, error } = await supabase
      .schema('infohub')
      .from('runs')
      .insert({
        title,
        brief_id: briefId ?? null,
        manual_brief: manualBrief ?? null,
        status: 'draft',
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  };

  const handleBriefSelect = async (brief: Brief) => {
    const run = await createRun(brief.topic, brief.id);
    setRunId(run.id);
    setRunTitle(brief.topic);
    setStep(2);
  };

  const handleManualSubmit = async (manual: import('../lib/types').ManualBrief) => {
    const run = await createRun(manual.goal, undefined, manual);
    setRunId(run.id);
    setRunTitle(manual.goal);
    setStep(2);
  };

  const saveRunSettings = async () => {
    if (!runId) return;
    await supabase
      .schema('infohub')
      .from('runs')
      .update({
        extraction_profiles: profiles,
        custom_extraction_points: customPoints.filter(Boolean),
        output_type: interview.output_type,
        desired_effect: interview.desired_effect,
        audience_level: interview.audience_level || null,
        scope_limits: interview.scope_limits || null,
        output_format: interview.output_format,
      })
      .eq('id', runId);
  };

  const handleRun = async () => {
    if (!runId) return;
    setRunning(true);
    try {
      await saveRunSettings();
      await supabase.schema('infohub').from('runs').update({ status: 'running' }).eq('id', runId);

      const doneSources = sources.filter(s => s.status === 'done');
      for (const source of doneSources) {
        const { data: insightDoc } = await supabase
          .schema('infohub')
          .from('insight_documents')
          .insert({ run_id: runId, source_id: source.id, status: 'pending' })
          .select()
          .single();

        if (insightDoc) {
          extractInsight(
            insightDoc.id,
            source.extracted_text ?? '',
            { topic: runTitle, audience: '', channels: [], output_type: interview.output_type, desired_effect: interview.desired_effect, scope_limits: interview.scope_limits },
            profiles,
            customPoints.filter(Boolean),
            interview.output_format,
          ).catch(console.error);
        }
      }

      window.location.hash = `#/kjoring/${runId}`;
    } catch (err) {
      console.error('Run failed:', err);
      setRunning(false);
    }
  };

  const doneSources = sources.filter(s => s.status === 'done');

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="flex items-center gap-3 mb-8">
        <a href="#/" className="p-2 text-nordic-text-muted hover:text-nordic-blue transition-colors rounded-lg hover:bg-nordic-bg">
          <ArrowLeft size={18} />
        </a>
        <h1 className="text-xl font-serif text-nordic-blue">Ny kjøring</h1>
      </div>

      <StepIndicator currentStep={step} />

      {/* Step 1 — Velg brief */}
      {step === 1 && (
        <div>
          <h2 className="text-lg font-serif text-nordic-blue mb-4">Velg brief</h2>
          <div className="flex gap-2 mb-5">
            <button
              onClick={() => setBriefMode('dynamisk')}
              className={`px-4 py-2 text-sm rounded-xl border transition-colors ${
                briefMode === 'dynamisk'
                  ? 'border-nordic-blue bg-nordic-blue-light text-nordic-blue font-medium'
                  : 'border-nordic-border text-nordic-text-muted hover:border-nordic-blue'
              }`}
            >
              Hent fra Dynamisk Brief
            </button>
            <button
              onClick={() => setBriefMode('manuell')}
              className={`px-4 py-2 text-sm rounded-xl border transition-colors ${
                briefMode === 'manuell'
                  ? 'border-nordic-blue bg-nordic-blue-light text-nordic-blue font-medium'
                  : 'border-nordic-border text-nordic-text-muted hover:border-nordic-blue'
              }`}
            >
              Skriv inn manuelt
            </button>
          </div>
          {briefMode === 'dynamisk'
            ? <BriefSelector onSelect={handleBriefSelect} />
            : <ManualBriefForm onSubmit={handleManualSubmit} />
          }
        </div>
      )}

      {/* Step 2 — Legg til kilder */}
      {step === 2 && runId && (
        <div>
          <h2 className="text-lg font-serif text-nordic-blue mb-4">Legg til kilder</h2>
          <SourceInput runId={runId} sources={sources} onSourcesChange={setSources} />
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setStep(3)}
              disabled={doneSources.length === 0}
              className="px-6 py-2.5 bg-nordic-blue text-white text-sm font-medium rounded-xl hover:bg-nordic-blue/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Neste
            </button>
          </div>
          {doneSources.length === 0 && (
            <p className="text-xs text-center text-nordic-text-muted mt-2">Legg til minst én kilde som er ferdig behandlet.</p>
          )}
        </div>
      )}

      {/* Step 3 — Uttaksprofiler */}
      {step === 3 && (
        <div>
          <h2 className="text-lg font-serif text-nordic-blue mb-4">Velg uttaksprofiler</h2>
          <ExtractionProfiles
            profiles={profiles}
            customPoints={customPoints}
            onChange={(p, cp) => { setProfiles(p); setCustomPoints(cp); }}
          />
          <div className="mt-6 flex justify-between">
            <button onClick={() => setStep(2)} className="px-4 py-2.5 text-sm text-nordic-text-muted hover:text-nordic-blue transition-colors">
              Tilbake
            </button>
            <button
              onClick={() => setStep(4)}
              disabled={profiles.length === 0}
              className="px-6 py-2.5 bg-nordic-blue text-white text-sm font-medium rounded-xl hover:bg-nordic-blue/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Neste
            </button>
          </div>
        </div>
      )}

      {/* Step 4 — Presisering */}
      {step === 4 && (
        <div>
          <h2 className="text-lg font-serif text-nordic-blue mb-4">Presisering</h2>
          <MiniInterview values={interview} onChange={setInterview} />
          <div className="mt-6 flex justify-between">
            <button onClick={() => setStep(3)} className="px-4 py-2.5 text-sm text-nordic-text-muted hover:text-nordic-blue transition-colors">
              Tilbake
            </button>
            <button
              onClick={() => setStep(5)}
              className="px-6 py-2.5 bg-nordic-blue text-white text-sm font-medium rounded-xl hover:bg-nordic-blue/90 transition-colors"
            >
              Neste
            </button>
          </div>
        </div>
      )}

      {/* Step 5 — Bekreft og kjør */}
      {step === 5 && (
        <div>
          <h2 className="text-lg font-serif text-nordic-blue mb-4">Bekreft og kjør</h2>
          <RunConfirmCard
            run={{ title: runTitle, extraction_profiles: profiles, custom_extraction_points: customPoints, output_format: interview.output_format, scope_limits: interview.scope_limits || null }}
            sources={sources}
            onRun={handleRun}
            loading={running}
          />
          <div className="mt-4 flex justify-start">
            <button onClick={() => setStep(4)} className="px-4 py-2.5 text-sm text-nordic-text-muted hover:text-nordic-blue transition-colors">
              Tilbake
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
