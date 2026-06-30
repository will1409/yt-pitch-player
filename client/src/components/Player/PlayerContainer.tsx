import React from 'react';
import { YoutubePlayer } from './YoutubePlayer';
import { usePlayerStore } from '../../store/playerStore';
import { useAudioEngine } from '../../hooks/useAudioEngine';
import { MdPlayCircleFilled, MdCheckCircle, MdErrorOutline, MdSync } from 'react-icons/md';

const statusConfig = {
  idle: null,
  loading: {
    icon: <MdSync className="text-violet-400 animate-spin" />,
    text: 'Carregando áudio com pitch...',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10 border-violet-500/20',
  },
  ready: {
    icon: <MdCheckCircle className="text-emerald-400" />,
    text: 'Áudio pronto — pitch ativo',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
  },
  error: {
    icon: <MdErrorOutline className="text-red-400" />,
    text: 'Servidor backend não encontrado. Rode: cd server && npm run dev',
    color: 'text-red-400',
    bg: 'bg-red-500/10 border-red-500/20',
  },
};

export const PlayerContainer: React.FC = () => {
  const { videoId, isBuffering } = usePlayerStore();
  const { engineStatus } = useAudioEngine();

  const status = statusConfig[engineStatus];

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-3">
      <div className="relative rounded-2xl overflow-hidden bg-black/40 border border-white/10 shadow-2xl shadow-black/60">
        {!videoId ? (
          <div className="aspect-video flex flex-col items-center justify-center gap-4 text-white/20">
            <MdPlayCircleFilled className="text-7xl" />
            <p className="text-sm font-medium">Cole uma URL do YouTube e clique em Carregar</p>
          </div>
        ) : (
          <div className="relative">
            <YoutubePlayer />
            {isBuffering && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl pointer-events-none">
                <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Status do AudioEngine */}
      {videoId && status && (
        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs ${status.bg} ${status.color}`}>
          {status.icon}
          <span>{status.text}</span>
        </div>
      )}
    </div>
  );
};
