'use client';

import { useEffect, useRef, useState } from 'react';

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
  const [isMuted, setIsMuted] = useState(true);

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
              // Start muted for autoplay (browser requirement); stay muted until user unmutes
              event.target.mute();
              event.target.playVideo();
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
              // Start muted for autoplay (browser requirement); stay muted until user unmutes
              event.target.mute();
              event.target.playVideo();
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
              // Section is in view - play video (stay muted until user unmutes)
              playerRef.current.playVideo();
            } else {
              // Section is out of view - mute and pause
              playerRef.current.mute();
              playerRef.current.pauseVideo();
              setIsMuted(true); // keep UI in sync
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

  const handleToggleMute = () => {
    if (!playerRef.current) return;
    if (isMuted) {
      playerRef.current.unMute();
      setIsMuted(false);
    } else {
      playerRef.current.mute();
      setIsMuted(true);
    }
  };

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

      {/* Unmute button - visible when muted so user can enable sound */}
      <button
        type="button"
        onClick={handleToggleMute}
        className="absolute bottom-4 right-4 z-10 flex items-center gap-2 rounded-full bg-black/60 px-4 py-2.5 text-white backdrop-blur-sm transition hover:bg-black/80 focus:outline-none focus:ring-2 focus:ring-white/50"
        aria-label={isMuted ? 'Unmute video' : 'Mute video'}
      >
        {isMuted ? (
          <>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
            <span>Unmute</span>
          </>
        ) : (
          <>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
            <span>Mute</span>
          </>
        )}
      </button>
    </section>
  );
}

