import React from 'react';
import { usePlayerStore } from '../../store/playerStore';

const PITCH_RANGE = Array.from({ length: 25 }, (_, i) => i - 12); // -12 a +12

/** Formata o pitch com sinal para exibição. */
function formatPitch(value: number): string {
  if (value > 0) return `+${value}`;
  return `${value}`;
}

/** Cor de fundo baseada no valor de pitch. */
function getPitchColor(value: number, isActive: boolean): string {
  if (isActive) {
    if (value < 0) return 'bg-sky-600 text-white border-sky-400 shadow-lg shadow-sky-600/40';
    if (value > 0) return 'bg-violet-600 text-white border-violet-400 shadow-lg shadow-violet-600/40';
    return 'bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-600/40';
  }
  return 'bg-white/5 text-white/40 border-white/10 hover:bg-white/10 hover:text-white/70 hover:border-white/20';
}

export const PitchGrid: React.FC = () => {
  const { pitch, setPitch } = usePlayerStore();

  return (
    <div className="w-full">
      <p className="text-center text-white/30 text-xs font-medium mb-3 uppercase tracking-widest">
        Selecionar Pitch
      </p>
      <div className="grid grid-cols-[repeat(25,_1fr)] gap-1">
        {PITCH_RANGE.map((value) => {
          const isActive = pitch === value;
          return (
            <button
              key={value}
              onClick={() => setPitch(value)}
              title={`Pitch ${formatPitch(value)}`}
              className={[
                'aspect-square flex items-center justify-center rounded-lg border text-xs font-bold transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 select-none',
                getPitchColor(value, isActive),
                isActive ? 'scale-110' : 'hover:scale-105',
              ].join(' ')}
            >
              {formatPitch(value)}
            </button>
          );
        })}
      </div>
      {/* Labels -12 e +12 */}
      <div className="flex justify-between mt-2 text-white/20 text-xs px-0.5">
        <span>-12</span>
        <span>0</span>
        <span>+12</span>
      </div>
    </div>
  );
};
