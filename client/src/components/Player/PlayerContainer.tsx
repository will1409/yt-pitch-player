import React from 'react';
import { usePlayerStore } from '../../store/playerStore';
import { MultitrackPlayer } from './MultitrackPlayer';
import { MdPlayCircleFilled, MdAutoAwesome } from 'react-icons/md';

export const PlayerContainer: React.FC = () => {
  const { videoUrl, jobStatus } = usePlayerStore();

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-3">
      {jobStatus === 'idle' && (
        <div className="relative rounded-2xl overflow-hidden bg-black/40 border border-white/10 shadow-2xl shadow-black/60 aspect-video flex flex-col items-center justify-center gap-4 text-white/20">
          <MdPlayCircleFilled className="text-7xl" />
          <p className="text-sm font-medium">Cole uma URL do YouTube e clique em Separar Faixas</p>
        </div>
      )}

      {jobStatus === 'processing' && (
        <div className="relative rounded-2xl overflow-hidden bg-black/40 border border-violet-500/30 shadow-2xl shadow-violet-900/20 aspect-video flex flex-col items-center justify-center gap-6 text-white text-center px-4">
          <MdAutoAwesome className="text-6xl text-violet-400 animate-pulse" />
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-violet-100">Inteligência Artificial Trabalhando</h2>
            <p className="text-sm text-white/60 max-w-md">
              Estamos baixando o áudio, alterando o tom com qualidade de estúdio e usando Redes Neurais para separar a voz dos instrumentos.
            </p>
            <p className="text-xs text-emerald-400 font-semibold mt-4 bg-emerald-400/10 inline-block px-3 py-1 rounded-full border border-emerald-400/20">
              Isso pode levar de 1 a 2 minutos...
            </p>
          </div>
          <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mt-4" />
        </div>
      )}

      {jobStatus === 'success' && (
        <MultitrackPlayer />
      )}
    </div>
  );
};
