import React, { useRef } from 'react';
import { MdLink, MdPlayCircle, MdClear } from 'react-icons/md';
import { Button } from '../ui/Button';
import { usePlayerStore } from '../../store/playerStore';
import { useYoutubePlayer } from '../../hooks/useYoutubePlayer';

export const UrlInput: React.FC = () => {
  const { videoUrl, setVideoUrl, error, setError } = usePlayerStore();
  const { loadVideo } = useYoutubePlayer();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') loadVideo();
  };

  const handleClear = () => {
    setVideoUrl('');
    setError(null);
    inputRef.current?.focus();
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-3">
      <div className="flex items-center gap-3">
        {/* Input */}
        <div className="relative flex-1">
          <MdLink className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-xl pointer-events-none" />
          <input
            ref={inputRef}
            type="url"
            value={videoUrl}
            onChange={(e) => {
              setVideoUrl(e.target.value);
              if (error) setError(null);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Cole a URL do YouTube aqui..."
            className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 rounded-xl pl-11 pr-10 py-3.5 text-white placeholder-white/25 text-sm transition-all duration-200 outline-none"
            autoComplete="off"
            spellCheck={false}
          />
          {videoUrl && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors p-1 rounded"
            >
              <MdClear className="text-lg" />
            </button>
          )}
        </div>

        {/* Botão */}
        <Button
          variant="primary"
          size="lg"
          onClick={loadVideo}
          disabled={!videoUrl.trim()}
          className="shrink-0 flex items-center gap-2"
        >
          <MdPlayCircle className="text-xl" />
          <span className="hidden sm:inline">Carregar vídeo</span>
          <span className="sm:hidden">Carregar</span>
        </Button>
      </div>

      {/* Mensagem de erro */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm animate-in fade-in slide-in-from-top-1 duration-200">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
