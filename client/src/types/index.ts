// types/index.ts
// Tipos globais do YouTube Pitch Player

export type PitchValue = -12 | -11 | -10 | -9 | -8 | -7 | -6 | -5 | -4 | -3 | -2 | -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export interface PlayerState {
  videoId: string | null;
  videoUrl: string;
  pitch: number;
  isPlaying: boolean;
  isLoaded: boolean;
  isBuffering: boolean;
  error: string | null;
}

export interface PlayerActions {
  setVideoUrl: (url: string) => void;
  setVideoId: (id: string | null) => void;
  setPitch: (pitch: number) => void;
  incrementPitch: () => void;
  decrementPitch: () => void;
  resetPitch: () => void;
  setIsPlaying: (playing: boolean) => void;
  setIsLoaded: (loaded: boolean) => void;
  setIsBuffering: (buffering: boolean) => void;
  setError: (error: string | null) => void;
}

export type PlayerStore = PlayerState & PlayerActions;

export interface YoutubePlayerRef {
  playVideo: () => void;
  pauseVideo: () => void;
  getPlayerState: () => number;
}

export interface AudioEngineConfig {
  pitch: number;
}
