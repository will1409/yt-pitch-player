import React from 'react';
import YouTube, { YouTubeEvent, YouTubeProps } from 'react-youtube';
import { usePlayerStore } from '../../store/playerStore';
import { useYoutubePlayer } from '../../hooks/useYoutubePlayer';
import { setYoutubePlayer } from '../../services/youtubePlayerRef';

export const YoutubePlayer: React.FC = () => {
  const videoId = usePlayerStore((s) => s.videoId);
  const { onPlayerReady, onPlayerStateChange, onPlayerError } = useYoutubePlayer();

  const opts: YouTubeProps['opts'] = {
    width: '100%',
    height: '100%',
    playerVars: {
      autoplay: 1,
      rel: 0,
      modestbranding: 1,
      mute: 1, // YouTube mutado — áudio real vem do AudioEngine com pitch
    },
  };

  if (!videoId) return null;

  return (
    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
      <div className="absolute inset-0">
        <YouTube
          videoId={videoId}
          opts={opts}
          onReady={(e: YouTubeEvent) => {
            // Registra o player para acesso ao currentTime fora do React
            setYoutubePlayer(e.target as { getCurrentTime(): number; getPlayerState(): number });
            onPlayerReady(e);
          }}
          onStateChange={(e: YouTubeEvent) => onPlayerStateChange(e)}
          onError={(e: YouTubeEvent) => onPlayerError(e)}
          className="w-full h-full"
          iframeClassName="w-full h-full rounded-xl"
        />
      </div>
    </div>
  );
};
