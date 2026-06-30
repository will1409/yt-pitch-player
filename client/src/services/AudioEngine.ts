/**
 * AudioEngine — HTML5 Audio + Tone.PitchShift
 *
 * Pipeline de áudio:
 *   Backend /api/audio/:id (proxy YouTube com chunked streaming)
 *     └─> HTMLAudioElement (crossOrigin="anonymous")
 *         └─> MediaElementAudioSourceNode
 *             └─> Tone.PitchShift (mudança de pitch em tempo real)
 *                 └─> AudioContext.destination (saída)
 */

import * as Tone from 'tone';
import type { AudioEngineConfig } from '../types';

export type EngineStatus = 'idle' | 'loading' | 'ready' | 'error';

const AUDIO_API_BASE = (import.meta.env.VITE_API_URL as string) || '/api/audio';
const BASE_FREQ = 440;

export class AudioEngine {
  private audioEl: HTMLAudioElement | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private pitchShift: Tone.PitchShift | null = null;

  // Tom de teste
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private _testTonePlaying = false;

  private _pitch = 0;
  private _videoId: string | null = null;
  private _status: EngineStatus = 'idle';
  private _onStatusChange: ((s: EngineStatus) => void) | null = null;

  setStatusListener(cb: (s: EngineStatus) => void): void {
    this._onStatusChange = cb;
  }

  private setStatus(s: EngineStatus): void {
    this._status = s;
    this._onStatusChange?.(s);
  }

  async loadVideo(videoId: string): Promise<void> {
    if (videoId === this._videoId && this._status === 'ready') return;

    await this.cleanupAudio();
    this.setStatus('loading');

    try {
      await Tone.start();

      this.pitchShift = new Tone.PitchShift(this._pitch);
      this.pitchShift.windowSize = 0.1; // Suaviza artefatos
      this.pitchShift.toDestination();

      this.audioEl = new Audio(`${AUDIO_API_BASE}/${videoId}?t=${Date.now()}`);
      this.audioEl.crossOrigin = 'anonymous'; // Essencial para Web Audio API processar o stream

      const ctx = (Tone.context.rawContext || Tone.getContext().rawContext) as AudioContext;
      this.sourceNode = ctx.createMediaElementSource(this.audioEl);
      
      // Conecta o nó nativo ao nó do Tone.js
      Tone.connect(this.sourceNode, this.pitchShift);

      // Aguarda o áudio começar a bufferizar (streaming) em vez de baixar tudo
      await new Promise<void>((resolve, reject) => {
        if (!this.audioEl) return reject(new Error('Audio element destroyed'));
        
        this.audioEl.oncanplay = () => {
          this.setStatus('ready');
          resolve();
        };
        this.audioEl.onerror = (e) => reject(e);
      });

      this._videoId = videoId;
    } catch (err) {
      console.error('[AudioEngine] loadVideo falhou:', err);
      this.setStatus('error');
    }
  }

  async play(syncTime = 0): Promise<void> {
    if (this._status !== 'ready' || !this.audioEl) return;
    await Tone.start();

    // Sincroniza o tempo com o YouTube
    this.audioEl.currentTime = syncTime;
    
    try {
      await this.audioEl.play();
    } catch (err) {
      console.error('[AudioEngine] Play failed:', err);
    }
  }

  pause(): void {
    if (this.audioEl && !this.audioEl.paused) {
      this.audioEl.pause();
    }
  }

  setPitch(semitones: number): void {
    this._pitch = semitones;

    if (this.pitchShift) {
      this.pitchShift.pitch = semitones;
    }

    if (this._testTonePlaying && this.oscillator) {
      const ctx = Tone.getContext().rawContext as AudioContext;
      const freq = BASE_FREQ * Math.pow(2, semitones / 12);
      this.oscillator.frequency.setTargetAtTime(freq, ctx.currentTime, 0.01);
    }
  }

  getPitch(): number { return this._pitch; }
  getStatus(): EngineStatus { return this._status; }
  reset(): void { this.setPitch(0); }

  async startTestTone(): Promise<void> {
    if (this._testTonePlaying) return;
    await Tone.start();

    const ctx = Tone.getContext().rawContext as AudioContext;

    this.gainNode = ctx.createGain();
    this.gainNode.gain.setValueAtTime(0, ctx.currentTime);
    this.gainNode.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.05);
    this.gainNode.connect(ctx.destination);

    this.oscillator = ctx.createOscillator();
    this.oscillator.type = 'sine';
    this.oscillator.frequency.setValueAtTime(
      BASE_FREQ * Math.pow(2, this._pitch / 12),
      ctx.currentTime
    );
    this.oscillator.connect(this.gainNode);
    this.oscillator.start();

    this._testTonePlaying = true;
  }

  stopTestTone(): void {
    if (!this._testTonePlaying || !this.oscillator || !this.gainNode) return;

    const ctx = Tone.getContext().rawContext as AudioContext;
    this.gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);

    const osc = this.oscillator;
    const gain = this.gainNode;
    setTimeout(() => {
      try { osc.stop(); osc.disconnect(); gain.disconnect(); } catch { /* ignorado */ }
    }, 150);

    this.oscillator = null;
    this.gainNode = null;
    this._testTonePlaying = false;
  }

  isTestTonePlaying(): boolean { return this._testTonePlaying; }

  private async cleanupAudio(): Promise<void> {
    if (this.audioEl) {
      this.audioEl.pause();
      this.audioEl.removeAttribute('src');
      this.audioEl.load();
      this.audioEl = null;
    }
    if (this.sourceNode) {
      try { this.sourceNode.disconnect(); } catch { /* ignorado */ }
      this.sourceNode = null;
    }
    if (this.pitchShift) {
      try { this.pitchShift.disconnect(); this.pitchShift.dispose(); } catch { /* ignorado */ }
      this.pitchShift = null;
    }
    this._videoId = null;
    this._status = 'idle';
  }

  async destroy(): Promise<void> {
    this.stopTestTone();
    await this.cleanupAudio();
  }

  applyConfig(config: AudioEngineConfig): void {
    this.setPitch(config.pitch);
  }
}

export const audioEngine = new AudioEngine();
