'use client';

import { useRef, useEffect, useState } from 'react';

interface VideoHeroSectionProps {
  videoSrc?: string;
  poster?: string;
  className?: string;
}

export default function VideoHeroSection({
  videoSrc = '/videos/hero.mp4',
  poster = '/images/banners/hero-video-poster.jpg',
  className = '',
}: VideoHeroSectionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    // Ensure video plays on mount
    if (videoRef.current && !videoError) {
      videoRef.current.play().catch((error) => {
        console.log('Video autoplay prevented:', error);
        setVideoError(true);
      });
    }
  }, [videoError]);

  const handleVideoError = () => {
    setVideoError(true);
  };

  return (
    <section className={`relative w-full overflow-hidden ${className || 'h-[60vh] min-h-[400px]'}`}>
      {/* Fallback gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900" />
      
      {/* Video element */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        onError={handleVideoError}
        className="absolute inset-0 w-full h-full object-contain"
        poster={poster}
        style={{ display: videoError ? 'none' : 'block' }}
      >
        <source src={videoSrc} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </section>
  );
}

