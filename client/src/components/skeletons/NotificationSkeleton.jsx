import React from 'react';

const NotificationSkeleton = ({ skeletonRef }) => {
  return (
    <div className="notification-block" ref={skeletonRef}>
      <div className="notification-sender-info">
        <div className="pfp-container">
          <div className="skeleton-picture" style={{ width: '100%', height: '100%', borderRadius: '50%' }}></div>
        </div>
        <div className="sender-name-container">
          <div className="skeleton-line" style={{ height: '6px', width: '100px' }}></div>
          <div className="skeleton-line" style={{ width: '80px', height: '6px' }}></div>
        </div>
      </div>

      <div className="skeleton-line" style={{ width: '40px', height: '5px', marginBottom: '9px' }}></div>
    </div>
  );
};

export default NotificationSkeleton;
