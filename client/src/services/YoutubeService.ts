/**
 * YoutubeService — Abstração sobre a YouTube Iframe API.
 *
 * Encapsula o estado e os eventos do player YouTube, expondo
 * uma interface simples para os componentes React consumirem.
 * Toda interação com window.YT passa por aqui.
 */

export type YTPlayerState = 'unstarted' | 'ended' | 'playing' | 'paused' | 'buffering' | 'cued';

export interface YTPlayerCallbacks {
  onReady?: () => void;
  onStateChange?: (state: YTPlayerState) => void;
  onError?: (code: number) => void;
}

const YT_STATES: Record<number, YTPlayerState> = {
  [-1]: 'unstarted',
  [0]: 'ended',
  [1]: 'playing',
  [2]: 'paused',
  [3]: 'buffering',
  [5]: 'cued',
};

export function parseYoutubeVideoId(url: string): string | null {
  if (!url.trim()) return null;

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
}

export function mapYTState(code: number): YTPlayerState {
  return YT_STATES[code] ?? 'unstarted';
}

/**
 * YoutubeService gerencia instâncias do player e callbacks.
 * Os componentes devem usar o hook useYoutubePlayer ao invés de instanciar diretamente.
 */
export class YoutubeService {
  private callbacks: YTPlayerCallbacks = {};

  setCallbacks(callbacks: YTPlayerCallbacks): void {
    this.callbacks = callbacks;
  }

  onPlayerReady(): void {
    this.callbacks.onReady?.();
  }

  onPlayerStateChange(code: number): void {
    this.callbacks.onStateChange?.(mapYTState(code));
  }

  onPlayerError(code: number): void {
    this.callbacks.onError?.(code);
  }
}

export const youtubeService = new YoutubeService();
