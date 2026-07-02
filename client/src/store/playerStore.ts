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
  drumsUrl: null,
  bassUrl: null,
  otherUrl: null,
  pianoUrl: null,
  guitarUrl: null,
  vocalsVolume: 1,
  drumsVolume: 1,
  bassVolume: 1,
  otherVolume: 1,
  pianoVolume: 1,
  guitarVolume: 1,
  
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
  setStems: (stems) => {
    if (!stems) {
      set({ vocalsUrl: null, drumsUrl: null, bassUrl: null, otherUrl: null, pianoUrl: null, guitarUrl: null });
    } else {
      set({ 
        vocalsUrl: stems.vocals, 
        drumsUrl: stems.drums, 
        bassUrl: stems.bass, 
        otherUrl: stems.other,
        pianoUrl: stems.piano,
        guitarUrl: stems.guitar
      });
    }
  },
  setVocalsVolume: (vol) => set({ vocalsVolume: vol }),
  setDrumsVolume: (vol) => set({ drumsVolume: vol }),
  setBassVolume: (vol) => set({ bassVolume: vol }),
  setOtherVolume: (vol) => set({ otherVolume: vol }),
  setPianoVolume: (vol) => set({ pianoVolume: vol }),
  setGuitarVolume: (vol) => set({ guitarVolume: vol }),
  
  setError: (error) => set({ error }),
}));
