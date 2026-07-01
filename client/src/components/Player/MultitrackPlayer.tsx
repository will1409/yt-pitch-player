import React, { useRef, useEffect } from 'react';
import { usePlayerStore } from '../../store/playerStore';
import { MdPlayArrow, MdPause } from 'react-icons/md';

export const MultitrackPlayer: React.FC = () => {
  const { 
    vocalsUrl, accompanimentUrl, 
    vocalsVolume, accompanimentVolume,
    setVocalsVolume, setAccompanimentVolume,
    isPlaying, setIsPlaying
  } = usePlayerStore();

  const vocalsRef = useRef<HTMLAudioElement>(null);
  const accompanimentRef = useRef<HTMLAudioElement>(null);

  // Sincroniza Play/Pause
  useEffect(() => {
    if (!vocalsRef.current || !accompanimentRef.current) return;
    
    if (isPlaying) {
      vocalsRef.current.play();
      accompanimentRef.current.play();
    } else {
      vocalsRef.current.pause();
      accompanimentRef.current.pause();
    }
  }, [isPlaying]);

  // Sincroniza Volume
  useEffect(() => {
    if (vocalsRef.current) vocalsRef.current.volume = vocalsVolume;
  }, [vocalsVolume]);

  useEffect(() => {
    if (accompanimentRef.current) accompanimentRef.current.volume = accompanimentVolume;
  }, [accompanimentVolume]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  if (!vocalsUrl || !accompanimentUrl) return null;

  return (
    <div className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 flex flex-col gap-6">
      
      {/* Áudios Ocultos */}
      <audio ref={vocalsRef} src={vocalsUrl} preload="auto" />
      <audio ref={accompanimentRef} src={accompanimentUrl} preload="auto" />

      {/* Play/Pause Global */}
      <div className="flex justify-center">
        <button 
          onClick={togglePlay}
          className="w-16 h-16 rounded-full bg-violet-600 hover:bg-violet-500 flex items-center justify-center text-white text-3xl shadow-lg transition-transform active:scale-95"
        >
          {isPlaying ? <MdPause /> : <MdPlayArrow />}
        </button>
      </div>

      {/* Mixer de Canais */}
      <div className="flex flex-col gap-4 bg-white/5 p-4 rounded-xl">
        <h3 className="text-white/70 font-semibold text-sm uppercase tracking-wider mb-2">Mixer (Estúdio)</h3>
        
        {/* Voz */}
        <div className="flex items-center gap-4">
          <div className="w-24 text-white/90 text-sm">Vocais</div>
          <input 
            type="range" 
            min="0" max="1" step="0.01" 
            value={vocalsVolume}
            onChange={(e) => setVocalsVolume(parseFloat(e.target.value))}
            className="flex-1 accent-violet-500"
          />
          <div className="w-12 text-right text-white/50 text-xs">{Math.round(vocalsVolume * 100)}%</div>
        </div>

        {/* Instrumentos */}
        <div className="flex items-center gap-4">
          <div className="w-24 text-white/90 text-sm">Instrumentos</div>
          <input 
            type="range" 
            min="0" max="1" step="0.01" 
            value={accompanimentVolume}
            onChange={(e) => setAccompanimentVolume(parseFloat(e.target.value))}
            className="flex-1 accent-emerald-500"
          />
          <div className="w-12 text-right text-white/50 text-xs">{Math.round(accompanimentVolume * 100)}%</div>
        </div>
      </div>

    </div>
  );
};
