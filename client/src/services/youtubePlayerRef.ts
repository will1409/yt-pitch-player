/**
 * youtubePlayerRef — Referência singleton do player YouTube.
 *
 * Permite que o AudioEngine acesse o estado atual do player
 * (currentTime, playerState) sem acoplar React ao service.
 */

type YTPlayerLike = {
  getCurrentTime(): number;
  getPlayerState(): number;
};

let _player: YTPlayerLike | null = null;

export function setYoutubePlayer(player: YTPlayerLike): void {
  _player = player;
}

/** Retorna o tempo atual do vídeo em segundos. */
export function getYoutubeCurrentTime(): number {
  return _player?.getCurrentTime() ?? 0;
}

/** Retorna true se o YouTube está tocando agora (state === 1). */
export function isYoutubePlaying(): boolean {
  return _player?.getPlayerState() === 1;
}
