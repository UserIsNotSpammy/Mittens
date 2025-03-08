import React, { useRef, useEffect, useState } from 'react';
import Plyr from 'plyr';

const VideoPlayer = ({ src, maxHeight }) => {
  const videoRef = useRef();
  const plyrRef = useRef();
  const [isPlyrReady, setIsPlyrReady] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      plyrRef.current = new Plyr(videoRef.current, {
        controls: ['play', 'progress', 'current-time', 'volume', 'settings', 'fullscreen'],
        speed: {
          selected: 1,
          options: [0.5, 1, 2],
        },
      });

      plyrRef.current.on('ready', () => {
        setIsPlyrReady(true);
      });

      plyrRef.current.on('enterfullscreen', () => {
        videoRef.current.style.maxHeight = 'none';
      });

      plyrRef.current.on('exitfullscreen', () => {
        videoRef.current.style.maxHeight = `${maxHeight}px`;
      });
    }

    return () => {
      if (plyrRef.current) {
        plyrRef.current.destroy();
        plyrRef.current = null;
      }
    };
  }, [src]);

  return (
    <div className="video-wrapper" style={{ position: 'relative' }}>
      <video
        playsInline
        ref={videoRef}
        style={{
          '--plyr-color-main': '#28343e',
          '--plyr-badge-border-radius': '1em',
          opacity: isPlyrReady ? 1 : 0, // Hide the video until Plyr is ready
          transition: 'opacity 0.3s ease-in-out', // Smooth transition for showing the video
        }}
        controls>
        <source src={src} />
      </video>
    </div>
  );
};

export default VideoPlayer;
