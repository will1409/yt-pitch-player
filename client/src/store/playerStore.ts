import { create } from 'zustand';
import type { PlayerStore } from '../types';

const MIN_PITCH = -12;
const MAX_PITCH = 12;
const clampPitch = (v: number) => Math.max(MIN_PITCH, Math.min(MAX_PITCH, v));

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  // State
  videoId: null,
  videoUrl: '',
  pitch: 0,
  isPlaying: false,
  isLoaded: false,
  isBuffering: false,
  error: null,

  // Actions
  setVideoUrl: (url) => set({ videoUrl: url }),
  setVideoId: (id) => set({ videoId: id, isLoaded: false, error: null }),
  setPitch: (pitch) => set({ pitch: clampPitch(pitch) }),
  incrementPitch: () => set({ pitch: clampPitch(get().pitch + 1) }),
  decrementPitch: () => set({ pitch: clampPitch(get().pitch - 1) }),
  resetPitch: () => set({ pitch: 0 }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setIsLoaded: (isLoaded) => set({ isLoaded }),
  setIsBuffering: (isBuffering) => set({ isBuffering }),
  setError: (error) => set({ error }),
}));
