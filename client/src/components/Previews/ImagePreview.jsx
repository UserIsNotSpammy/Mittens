import React from 'react';
import Loader from '../Loader';
import MySwiper from '../FeedContent/MySwiper';
const ImagePreview = ({ src, onDiscard, loadStatus, onAbort, strokeVal, fileCounter }) => (
  <>
    {fileCounter === 1 && src.find((_, i) => !strokeVal[i].discarded) && (
      <div className="img-preview-container">
        <Loader status={loadStatus} stroke={strokeVal[src.findIndex((_, i) => !strokeVal[i].discarded)].uploadStatus} />
        <div
          className="img-overlay"
          style={{
            backgroundImage: `url(${src[src.findIndex((_, i) => !strokeVal[i].discarded)]})`,
          }}></div>
        <div
          className="discard-icon"
          onClick={() => {
            const validIndex = src.findIndex((_, i) => !strokeVal[i].discarded);
            !strokeVal[validIndex].finished ? onAbort(validIndex) : onDiscard(validIndex);
          }}>
          <img src="./images/icons/trash.png" alt="Discard" />
        </div>
        <img className="post-img" src={src[src.findIndex((_, i) => !strokeVal[i].discarded)]} alt="Post" />
      </div>
    )}

    {fileCounter > 1 && <MySwiper key={fileCounter} blobs={src} onAbort={onAbort} onDiscard={onDiscard} loadStatus={loadStatus} strokeVal={strokeVal} fileCounter={fileCounter} />}
  </>
);

export default ImagePreview;
