'use client';

import { useEffect, useRef } from 'react';

interface VideoHeroSectionProps {
  youtubeUrl?: string;
  className?: string;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export default function VideoHeroSection({
  youtubeUrl = 'https://youtu.be/Y7xDZtT8Gfk',
  className = '',
}: VideoHeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const playerRef = useRef<any>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Extract video ID from YouTube URL
  const getVideoId = (url: string): string => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : '';
  };

  const videoId = getVideoId(youtubeUrl);

  useEffect(() => {
    // Load YouTube IFrame API
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        const playerId = `youtube-player-${videoId}`;
        playerRef.current = new window.YT.Player(playerId, {
          videoId: videoId,
          playerVars: {
            autoplay: 1,
            loop: 1,
            playlist: videoId,
            mute: 1, // Start muted for autoplay (will unmute after play starts)
            controls: 0,
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
            iv_load_policy: 3,
            playsinline: 1,
          },
          events: {
            onReady: (event: any) => {
              // Start muted for autoplay (browser requirement)
              event.target.mute();
              event.target.playVideo();
              // Unmute after a short delay to allow autoplay
              setTimeout(() => {
                event.target.unMute();
              }, 500);
            },
            onStateChange: (event: any) => {
              // Ensure video is unmuted when playing
              if (event.data === window.YT.PlayerState.PLAYING) {
                event.target.unMute();
              }
            },
          },
        });
      };
    } else {
      // API already loaded, create player
      const playerId = `youtube-player-${videoId}`;
      if (!playerRef.current) {
        playerRef.current = new window.YT.Player(playerId, {
          videoId: videoId,
          playerVars: {
            autoplay: 1,
            loop: 1,
            playlist: videoId,
            mute: 1, // Start muted for autoplay (will unmute after play starts)
            controls: 0,
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
            iv_load_policy: 3,
            playsinline: 1,
          },
          events: {
            onReady: (event: any) => {
              // Start muted for autoplay (browser requirement)
              event.target.mute();
              event.target.playVideo();
              // Unmute after a short delay to allow autoplay
              setTimeout(() => {
                event.target.unMute();
              }, 500);
            },
            onStateChange: (event: any) => {
              // Ensure video is unmuted when playing
              if (event.data === window.YT.PlayerState.PLAYING) {
                event.target.unMute();
              }
            },
          },
        });
      }
    }

    // Intersection Observer to mute when scrolled past
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (playerRef.current) {
            if (entry.isIntersecting) {
              // Section is in view - play video and unmute
              playerRef.current.playVideo();
              playerRef.current.unMute();
            } else {
              // Section is out of view - mute the video
              playerRef.current.mute();
            }
          }
        });
      },
      {
        threshold: 0.1, // Trigger when 10% of section is visible
      }
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [videoId]);

  return (
    <section 
      ref={sectionRef}
      className={`relative w-full overflow-hidden ${className || 'h-[60vh] min-h-[400px]'}`}
    >
      {/* Fallback gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900" />
      
      {/* YouTube embed - API will create iframe here */}
      <div
        id={`youtube-player-${videoId}`}
        ref={iframeRef}
        className="absolute inset-0 w-full h-full"
      />
    </section>
  );
}

