import { useCallback } from 'react';
import { usePlayerStore } from '../store/playerStore';
import { parseYoutubeVideoId } from '../utils/youtube';
import { audioEngine } from '../services/AudioEngine';
import type { YouTubeEvent } from 'react-youtube';

/**
 * useYoutubePlayer — Controla o player YouTube e sincroniza o AudioEngine.
 *
 * O YouTube roda mutado (apenas visual). O áudio real vem do
 * backend proxy e é processado pelo AudioEngine com pitch shifting.
 */
export function useYoutubePlayer() {
  const { videoUrl, setVideoId, setError, setIsLoaded, setIsPlaying, setIsBuffering } =
    usePlayerStore();

  /** Extrai o videoId da URL e dispara o carregamento. */
  const loadVideo = useCallback(() => {
    const id = parseYoutubeVideoId(videoUrl);
    if (!id) {
      setError('URL inválida. Cole uma URL do YouTube válida.');
      return;
    }
    setError(null);
    setVideoId(id);
  }, [videoUrl, setVideoId, setError]);

  /** Chamado quando o player YouTube está pronto. Carrega o áudio via backend. */
  const onPlayerReady = useCallback(
    async (e: YouTubeEvent) => {
      setIsLoaded(true);
      setIsBuffering(false);

      const videoId = usePlayerStore.getState().videoId;
      if (videoId) {
        // Carrega o áudio do backend em paralelo
        audioEngine.loadVideo(videoId).catch((err) => {
          console.error('[useYoutubePlayer] Erro ao carregar áudio:', err);
        });
      }

      // Inicia o YouTube imediatamente
      e.target.playVideo();
    },
    [setIsLoaded, setIsBuffering]
  );

  /**
   * Chamado a cada mudança de estado do YouTube.
   * Sincroniza play/pause do AudioEngine com o player visual.
   */
  const onPlayerStateChange = useCallback(
    async (e: YouTubeEvent) => {
      const state: number = e.data;

      // YT.PlayerState: 1=playing, 2=paused, 0=ended, 3=buffering
      if (state === 1) {
        setIsPlaying(true);
        setIsBuffering(false);
        setIsLoaded(true);

        // Sincroniza posição e inicia reprodução do áudio processado
        const currentTime = e.target.getCurrentTime() as number;
        await audioEngine.play(currentTime);
      } else if (state === 2 || state === 0) {
        setIsPlaying(false);
        setIsBuffering(false);
        audioEngine.pause();
      } else if (state === 3) {
        setIsBuffering(true);
      }
    },
    [setIsPlaying, setIsBuffering, setIsLoaded]
  );

  /** Mapeamento de erros do YouTube para mensagens amigáveis. */
  const onPlayerError = useCallback(
    (e: YouTubeEvent) => {
      const messages: Record<number, string> = {
        2: 'Parâmetro inválido na URL do vídeo.',
        5: 'Erro de reprodução HTML5.',
        100: 'Vídeo não encontrado ou removido.',
        101: 'Reprodução em iframe não permitida para este vídeo.',
        150: 'Reprodução em iframe não permitida para este vídeo.',
      };
      setError(messages[e.data as number] ?? `Erro YouTube (código ${e.data as number}).`);
      setIsLoaded(false);
      audioEngine.pause();
    },
    [setError, setIsLoaded]
  );

  return { loadVideo, onPlayerReady, onPlayerStateChange, onPlayerError };
}
