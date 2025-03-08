import React, { useState, useContext, useEffect, useRef } from 'react';
import ViewImageWindow from '../window/ViewImageWindow.jsx';
import { LoginContext } from '../contexts/LoginContext.jsx';

const Image = ({ src, slider = false, img }) => {
  const { domain } = useContext(LoginContext);
  const [isMessageImageLoading, setIsMessageImageLoading] = useState(true);
  const [viewImageWindow, setViewImageWindow] = useState(false);
  const [skeletonSize, setSkeletonSize] = useState('auto');
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const aspectRatio = img?.metadata?.width / img?.metadata?.height;
      const computedMaxHeight = window.getComputedStyle(containerRef.current).maxHeight;

      const maxHeight = parseFloat(computedMaxHeight) || 500;

      let renderedHeight = containerWidth / aspectRatio;

      if (renderedHeight > maxHeight) {
        renderedHeight = maxHeight;
      }

      setSkeletonSize(`${renderedHeight}px`);
    }
  }, [img?.metadata, src]);

  return (
    <>
      {viewImageWindow && <ViewImageWindow src={`${domain}${src}`} onClose={() => setViewImageWindow(false)} />}
      <div ref={containerRef} className={slider ? 'swiper-slide attached-media-img-container' : 'attached-media-img-container'}>
        {isMessageImageLoading && <div className="skeleton-picture" style={{ width: '100%', height: skeletonSize }}></div>}
        <div
          className="attached-img-overlay"
          style={{
            backgroundImage: `url(${domain}${src})`,
            display: isMessageImageLoading ? 'none' : 'block',
          }}></div>
        <img key={src} className="media-img" style={isMessageImageLoading ? { display: 'none' } : {}} onLoad={() => setIsMessageImageLoading(false)} onClick={() => setViewImageWindow(true)} src={`${domain}${src}`} alt="Post" />
      </div>
    </>
  );
};

export default Image;
