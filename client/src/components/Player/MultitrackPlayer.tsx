import React, { useRef, useEffect } from 'react';
import { usePlayerStore } from '../../store/playerStore';
import { MdPlayArrow, MdPause } from 'react-icons/md';

export const MultitrackPlayer: React.FC = () => {
  const { 
    vocalsUrl, drumsUrl, bassUrl, otherUrl, pianoUrl, guitarUrl,
    vocalsVolume, drumsVolume, bassVolume, otherVolume, pianoVolume, guitarVolume,
    setVocalsVolume, setDrumsVolume, setBassVolume, setOtherVolume, setPianoVolume, setGuitarVolume,
    isPlaying, setIsPlaying
  } = usePlayerStore();

  const vocalsRef = useRef<HTMLAudioElement>(null);
  const drumsRef = useRef<HTMLAudioElement>(null);
  const bassRef = useRef<HTMLAudioElement>(null);
  const otherRef = useRef<HTMLAudioElement>(null);
  const pianoRef = useRef<HTMLAudioElement>(null);
  const guitarRef = useRef<HTMLAudioElement>(null);

  // Sincroniza Play/Pause
  useEffect(() => {
    const refs = [vocalsRef, drumsRef, bassRef, otherRef, pianoRef, guitarRef];
    
    if (isPlaying) {
      refs.forEach(ref => ref.current?.play());
    } else {
      refs.forEach(ref => ref.current?.pause());
    }
  }, [isPlaying]);

  // Sincroniza Volumes
  useEffect(() => { if (vocalsRef.current) vocalsRef.current.volume = vocalsVolume; }, [vocalsVolume]);
  useEffect(() => { if (drumsRef.current) drumsRef.current.volume = drumsVolume; }, [drumsVolume]);
  useEffect(() => { if (bassRef.current) bassRef.current.volume = bassVolume; }, [bassVolume]);
  useEffect(() => { if (otherRef.current) otherRef.current.volume = otherVolume; }, [otherVolume]);
  useEffect(() => { if (pianoRef.current) pianoRef.current.volume = pianoVolume; }, [pianoVolume]);
  useEffect(() => { if (guitarRef.current) guitarRef.current.volume = guitarVolume; }, [guitarVolume]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  if (!vocalsUrl) return null;

  const VolumeControl = ({ label, value, onChange, colorClass }: { label: string, value: number, onChange: (val: number) => void, colorClass: string }) => (
    <div className="flex items-center gap-4">
      <div className="w-24 text-white/90 text-sm">{label}</div>
      <input 
        type="range" 
        min="0" max="1" step="0.01" 
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className={`flex-1 ${colorClass}`}
      />
      <div className="w-12 text-right text-white/50 text-xs">{Math.round(value * 100)}%</div>
    </div>
  );

  return (
    <div className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 flex flex-col gap-6">
      
      {/* Áudios Ocultos */}
      <audio ref={vocalsRef} src={vocalsUrl} preload="auto" />
      <audio ref={drumsRef} src={drumsUrl!} preload="auto" />
      <audio ref={bassRef} src={bassUrl!} preload="auto" />
      <audio ref={otherRef} src={otherUrl!} preload="auto" />
      <audio ref={pianoRef} src={pianoUrl!} preload="auto" />
      <audio ref={guitarRef} src={guitarUrl!} preload="auto" />

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
        
        <VolumeControl label="Vocais" value={vocalsVolume} onChange={setVocalsVolume} colorClass="accent-violet-500" />
        <VolumeControl label="Bateria" value={drumsVolume} onChange={setDrumsVolume} colorClass="accent-emerald-500" />
        <VolumeControl label="Baixo" value={bassVolume} onChange={setBassVolume} colorClass="accent-blue-500" />
        <VolumeControl label="Guitarra/Violão" value={guitarVolume} onChange={setGuitarVolume} colorClass="accent-red-500" />
        <VolumeControl label="Teclado/Piano" value={pianoVolume} onChange={setPianoVolume} colorClass="accent-yellow-500" />
        <VolumeControl label="Outros" value={otherVolume} onChange={setOtherVolume} colorClass="accent-gray-400" />
      </div>

    </div>
  );
};
