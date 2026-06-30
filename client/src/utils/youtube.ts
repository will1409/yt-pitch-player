/**
 * utils/youtube.ts — Utilitários relacionados ao YouTube.
 * Re-exporta helpers do YoutubeService para uso em componentes.
 */

export { parseYoutubeVideoId } from '../services/YoutubeService';

/** Retorna a URL de thumbnail de qualidade máxima para um videoId. */
export function getYoutubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

/** Monta a URL de embed do YouTube. */
export function getYoutubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`;
}
