import { create } from 'zustand';
import type { PlayerStore } from '../types';

const MIN_PITCH = -12;
const MAX_PITCH = 12;
const clampPitch = (v: number) => Math.max(MIN_PITCH, Math.min(MAX_PITCH, v));

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  // State
  videoUrl: '',
  pitch: 0,
  isPlaying: false,
  
  // Multitrack State
  jobId: null,
  jobStatus: 'idle',
  vocalsUrl: null,
  accompanimentUrl: null,
  vocalsVolume: 1,
  accompanimentVolume: 1,
  
  error: null,

  // Actions
  setVideoUrl: (url) => set({ videoUrl: url }),
  setPitch: (pitch) => set({ pitch: clampPitch(pitch) }),
  incrementPitch: () => set({ pitch: clampPitch(get().pitch + 1) }),
  decrementPitch: () => set({ pitch: clampPitch(get().pitch - 1) }),
  resetPitch: () => set({ pitch: 0 }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  
  setJobId: (id) => set({ jobId: id }),
  setJobStatus: (status) => set({ jobStatus: status }),
  setStems: (vocals, accompaniment) => set({ vocalsUrl: vocals, accompanimentUrl: accompaniment }),
  setVocalsVolume: (vol) => set({ vocalsVolume: vol }),
  setAccompanimentVolume: (vol) => set({ accompanimentVolume: vol }),
  
  setError: (error) => set({ error }),
}));
