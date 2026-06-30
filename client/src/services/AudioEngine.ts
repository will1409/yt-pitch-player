/**
 * AudioEngine — Tone.Player + Tone.PitchShift (phase vocoder real).
 *
 * Pipeline de áudio:
 *   Backend /api/audio/:id (proxy YouTube)
 *     └─> Tone.Player (AudioBuffer na memória)
 *         └─> Tone.PitchShift  ← pitch muda aqui em tempo real
 *             └─> AudioContext.destination (saída)
 *
 * YouTube roda mutado — apenas visual.
 * A mudança de pitch é instantânea e não interrompe a reprodução.
 */

import * as Tone from 'tone';
import type { AudioEngineConfig } from '../types';

export type EngineStatus = 'idle' | 'loading' | 'ready' | 'error';

// Em produção, aponta para o backend no Railway (configurado em .env.production)
// Em desenvolvimento local, usa proxy do Vite (/api → localhost:3001)
const AUDIO_API_BASE = (import.meta.env.VITE_API_URL as string) || '/api/audio';
const BASE_FREQ = 440; // A4 — referência para o tom de teste

export class AudioEngine {
  private tonePlayer: Tone.Player | null = null;
  private pitchShift: Tone.PitchShift | null = null;

  // Tom de teste (oscilador independente)
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

  /**
   * Baixa o áudio do backend e prepara o pipeline de pitch shifting.
   * Tone.Player faz download do AudioBuffer — conexão 100% dentro do Tone.js.
   */
  async loadVideo(videoId: string): Promise<void> {
    if (videoId === this._videoId && this._status === 'ready') return;

    await this.cleanupAudio();
    this.setStatus('loading');

    try {
      await Tone.start();

      // PitchShift conectado direto à saída
      this.pitchShift = new Tone.PitchShift(this._pitch);
      this.pitchShift.toDestination();

      // Player conectado ao PitchShift — pipeline puro Tone.js (sem problemas de conexão)
      this.tonePlayer = new Tone.Player();
      this.tonePlayer.connect(this.pitchShift);

      // Baixa o áudio do proxy backend
      await this.tonePlayer.load(`${AUDIO_API_BASE}/${videoId}`);

      this._videoId = videoId;
      this.setStatus('ready');
    } catch (err) {
      console.error('[AudioEngine] loadVideo falhou:', err);
      this.setStatus('error');
    }
  }

  /**
   * Inicia reprodução a partir de `syncTime` (em segundos).
   * Chamado sempre que o YouTube começa a tocar.
   */
  async play(syncTime = 0): Promise<void> {
    if (this._status !== 'ready' || !this.tonePlayer) return;
    await Tone.start();

    if (this.tonePlayer.state === 'started') {
      this.tonePlayer.stop();
    }

    // `start(time, offset)` — inicia imediatamente no ponto sincronizado
    this.tonePlayer.start(Tone.now(), syncTime);
  }

  /** Para a reprodução (chamado ao pausar o YouTube). */
  pause(): void {
    if (this.tonePlayer?.state === 'started') {
      this.tonePlayer.stop();
    }
  }

  /**
   * Define o pitch em semitons (-12 a +12).
   * Muda instantaneamente sem interromper o áudio.
   */
  setPitch(semitones: number): void {
    this._pitch = semitones;

    if (this.pitchShift) {
      this.pitchShift.pitch = semitones; // ← mudança em tempo real
    }

    // Atualiza o oscilador de teste, se ativo
    if (this._testTonePlaying && this.oscillator) {
      const ctx = Tone.getContext().rawContext as AudioContext;
      const freq = BASE_FREQ * Math.pow(2, semitones / 12);
      this.oscillator.frequency.setTargetAtTime(freq, ctx.currentTime, 0.01);
    }
  }

  getPitch(): number { return this._pitch; }
  getStatus(): EngineStatus { return this._status; }
  reset(): void { this.setPitch(0); }

  // ── Tom de teste ──────────────────────────────────────────────────────────

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
      try { osc.stop(); osc.disconnect(); gain.disconnect(); } catch { /* já parado */ }
    }, 150);

    this.oscillator = null;
    this.gainNode = null;
    this._testTonePlaying = false;
  }

  isTestTonePlaying(): boolean { return this._testTonePlaying; }

  // ── Limpeza ───────────────────────────────────────────────────────────────

  private async cleanupAudio(): Promise<void> {
    if (this.tonePlayer) {
      try { this.tonePlayer.stop(); } catch { /* ignorado */ }
      try { this.tonePlayer.disconnect(); this.tonePlayer.dispose(); } catch { /* ignorado */ }
      this.tonePlayer = null;
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
