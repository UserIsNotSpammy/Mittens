import React, { useRef, useEffect } from 'react';
import Plyr from 'plyr';
import Loader from '../Loader';
const VideoPreview = ({ src, onDiscard, loadStatus, onAbort, strokeVal, maxHeight }) => {
  const videoRef = useRef();
  const player = new Plyr(videoRef.current);
  useEffect(() => {
    const player = new Plyr(videoRef.current);
    player.on('enterfullscreen', () => {
      videoRef.current.style.maxHeight = 'none';
    });
    player.on('exitfullscreen', () => {
      videoRef.current.style.maxHeight = `${maxHeight}px`;
    });
  }, [src]);

  useEffect(() => {
    if (player && loadStatus) {
      const icon = document.querySelector('.plyr__control--overlaid');
      const controlles = document.querySelectorAll('.plyr__control');

      icon.style.opacity = 0;
    }

    if (player && !loadStatus) {
      const icon = document.querySelector('.plyr__control--overlaid');
      const controlles = document.querySelectorAll('.plyr__control');

      icon.style.opacity = 0.8;
    }
  }, [loadStatus]);

  return (
    <div className="video-wrapper" style={{ position: 'relative' }}>
      <Loader status={loadStatus} stroke={strokeVal} />
      <video playsInline ref={videoRef} style={loadStatus ? { '--plyr-color-main': '#28343e', '--plyr-badge-border-radius': '1em' } : { '--plyr-color-main': '#28343e', '--plyr-badge-border-radius': '1em', opacity: 1 }} controls>
        <source src={src} />
      </video>
      <div
        className="discard-icon"
        onClick={() => {
          loadStatus ? onAbort() : onDiscard();
        }}>
        <img src="./images/icons/trash.png" alt="Discard" />
      </div>
    </div>
  );
};

export default VideoPreview;
