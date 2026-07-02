import React from 'react';
import { MdAdd, MdRemove, MdRefresh, MdPlayArrow } from 'react-icons/md';
import { PitchGrid } from './PitchGrid';
import { Button } from '../ui/Button';
import { usePlayerStore } from '../../store/playerStore';
import { useMoisesPipeline } from '../../hooks/useMoisesPipeline';

function formatPitch(value: number): string {
  if (value > 0) return `+${value}`;
  return `${value}`;
}

function getPitchLabel(value: number): string {
  if (value === 0) return 'Original';
  const abs = Math.abs(value);
  const dir = value > 0 ? 'acima' : 'abaixo';
  return `${abs} semitom${abs > 1 ? 's' : ''} ${dir}`;
}

function getPitchTextColor(value: number): string {
  if (value < 0) return 'text-sky-400';
  if (value > 0) return 'text-violet-400';
  return 'text-emerald-400';
}

export const PitchControls: React.FC = () => {
  const { pitch, incrementPitch, decrementPitch, resetPitch, jobStatus, videoUrl } = usePlayerStore();
  const { startPipeline } = useMoisesPipeline();

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6">
      {/* Card principal do pitch */}
      <div className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-6 flex flex-col items-center gap-4">
        {/* Glow de fundo animado com base na direção do pitch */}
        <div
          className={[
            'absolute inset-0 opacity-10 transition-all duration-500 pointer-events-none',
            pitch < 0 ? 'bg-sky-600' : pitch > 0 ? 'bg-violet-600' : 'bg-emerald-600',
          ].join(' ')}
        />

        <p className="text-white/40 text-xs uppercase tracking-widest font-medium z-10">Pitch</p>

        {/* Display grande do valor */}
        <div className="z-10 flex flex-col items-center">
          <span
            className={[
              'text-8xl font-black tabular-nums transition-all duration-200',
              getPitchTextColor(pitch),
            ].join(' ')}
          >
            {formatPitch(pitch)}
          </span>
          <span className="text-white/40 text-sm mt-1">{getPitchLabel(pitch)}</span>
        </div>

        {/* Controles [-] Reset [+] */}
        <div className="z-10 flex items-center gap-4">
          <button
            onClick={decrementPitch}
            disabled={pitch <= -12}
            aria-label="Diminuir pitch"
            className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 hover:bg-sky-600/20 hover:border-sky-500/40 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed text-white/70 hover:text-sky-300 transition-all duration-150 text-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
          >
            <MdRemove />
          </button>

          <Button
            variant="ghost"
            size="sm"
            onClick={resetPitch}
            disabled={pitch === 0}
            className="flex items-center gap-1.5 text-white/40"
          >
            <MdRefresh className="text-base" />
            Reset
          </Button>

          <button
            onClick={incrementPitch}
            disabled={pitch >= 12}
            aria-label="Aumentar pitch"
            className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 hover:bg-violet-600/20 hover:border-violet-500/40 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed text-white/70 hover:text-violet-300 transition-all duration-150 text-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
          >
            <MdAdd />
          </button>
        </div>

        {/* Botão Aplicar Tom */}
        <div className="z-10 mt-2">
          <Button
            variant="primary"
            size="md"
            onClick={startPipeline}
            disabled={!videoUrl.trim() || jobStatus === 'processing'}
            className="flex items-center gap-2 px-8"
          >
            <MdPlayArrow className="text-lg" />
            {jobStatus === 'processing' ? 'Processando IA...' : 'Aplicar Tom (Re-processar)'}
          </Button>
        </div>
      </div>

      {/* Grid de seleção rápida -12 a +12 */}
      <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
        <PitchGrid />
      </div>

      {/* Status inferior */}
      <div className="flex items-center justify-center gap-3 text-sm">
        <span className="text-white/30">Pitch Atual</span>
        <span className={['text-2xl font-bold tabular-nums transition-colors duration-200', getPitchTextColor(pitch)].join(' ')}>
          {formatPitch(pitch)}
        </span>
        <span className="text-white/30">semitons</span>
      </div>
    </div>
  );
};
