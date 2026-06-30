import { useEffect, useRef, useState, useCallback } from 'react';
import { audioEngine, type EngineStatus } from '../services/AudioEngine';
import { usePlayerStore } from '../store/playerStore';
import { isYoutubePlaying, getYoutubeCurrentTime } from '../services/youtubePlayerRef';

/**
 * useAudioEngine — Liga o AudioEngine ao Zustand store.
 *
 * Correção de timing: quando o áudio termina de carregar (status → 'ready'),
 * e o YouTube já está tocando, inicia a reprodução automaticamente
 * sincronizado com o ponto atual do vídeo.
 */
export function useAudioEngine() {
  const pitch = usePlayerStore((s) => s.pitch);
  const [engineStatus, setEngineStatus] = useState<EngineStatus>('idle');
  const [testTonePlaying, setTestTonePlaying] = useState(false);
  const listenerRegistered = useRef(false);

  // Registra o listener de status uma única vez
  useEffect(() => {
    if (listenerRegistered.current) return;
    listenerRegistered.current = true;
    audioEngine.setStatusListener(setEngineStatus);
  }, []);

  // Auto-start: quando o áudio fica pronto e o YouTube já está tocando
  useEffect(() => {
    if (engineStatus === 'ready') {
      if (isYoutubePlaying()) {
        const syncTime = getYoutubeCurrentTime();
        audioEngine.play(syncTime).catch((err) =>
          console.error('[useAudioEngine] auto-play falhou:', err)
        );
      }
    }
  }, [engineStatus]);

  // Sincroniza pitch com o AudioEngine em tempo real
  useEffect(() => {
    audioEngine.setPitch(pitch);
  }, [pitch]);

  const loadAudio = useCallback(async (videoId: string) => {
    await audioEngine.loadVideo(videoId);
  }, []);

  const playAudio = useCallback(async (syncTime?: number) => {
    await audioEngine.play(syncTime);
  }, []);

  const pauseAudio = useCallback(() => {
    audioEngine.pause();
  }, []);

  const toggleTestTone = useCallback(async () => {
    if (audioEngine.isTestTonePlaying()) {
      audioEngine.stopTestTone();
      setTestTonePlaying(false);
    } else {
      await audioEngine.startTestTone();
      setTestTonePlaying(true);
    }
  }, []);

  return {
    loadAudio,
    playAudio,
    pauseAudio,
    toggleTestTone,
    testTonePlaying,
    engineStatus,
  };
}
