// types/index.ts
// Tipos globais do YouTube Pitch Player

export type PitchValue = -12 | -11 | -10 | -9 | -8 | -7 | -6 | -5 | -4 | -3 | -2 | -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export interface PlayerState {
  videoUrl: string;
  pitch: number;
  isPlaying: boolean;
  
  jobId: string | null;
  jobStatus: 'idle' | 'processing' | 'success' | 'error';
  vocalsUrl: string | null;
  accompanimentUrl: string | null;
  vocalsVolume: number;
  accompanimentVolume: number;
  
  error: string | null;
}

export interface PlayerActions {
  setVideoUrl: (url: string) => void;
  setPitch: (pitch: number) => void;
  incrementPitch: () => void;
  decrementPitch: () => void;
  resetPitch: () => void;
  setIsPlaying: (playing: boolean) => void;
  
  setJobId: (id: string | null) => void;
  setJobStatus: (status: 'idle' | 'processing' | 'success' | 'error') => void;
  setStems: (vocals: string | null, accompaniment: string | null) => void;
  setVocalsVolume: (vol: number) => void;
  setAccompanimentVolume: (vol: number) => void;
  
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
