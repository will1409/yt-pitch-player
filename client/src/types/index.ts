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
  drumsUrl: string | null;
  bassUrl: string | null;
  otherUrl: string | null;
  pianoUrl: string | null;
  guitarUrl: string | null;
  vocalsVolume: number;
  drumsVolume: number;
  bassVolume: number;
  otherVolume: number;
  pianoVolume: number;
  guitarVolume: number;
  
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
  setStems: (stems: { vocals: string | null, drums: string | null, bass: string | null, other: string | null, piano: string | null, guitar: string | null } | null) => void;
  setVocalsVolume: (vol: number) => void;
  setDrumsVolume: (vol: number) => void;
  setBassVolume: (vol: number) => void;
  setOtherVolume: (vol: number) => void;
  setPianoVolume: (vol: number) => void;
  setGuitarVolume: (vol: number) => void;
  
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
