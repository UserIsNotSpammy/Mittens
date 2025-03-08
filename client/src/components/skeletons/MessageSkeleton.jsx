import React from 'react';

const MessageSkeleton = ({ flag, pciture, skeletonRef }) => {
  return (
    <div className={flag ? 'chat-message sent-msg' : 'chat-message'} ref={skeletonRef || null}>
      <div className="pfp-container">
        <div className="skeleton-picture" style={{ width: '42px', height: '42px', borderRadius: '50%', opacity: '0.7' }}></div>
      </div>
      <div className="message-body" style={{ width: '100%' }}>
        {/* <span className="message-text"></span> */}
        <div className="skeleton-line short" style={{ width: '100%', opacity: '0.3' }}></div>
        {!pciture && <div className="skeleton-line short" style={{ width: '40%', opacity: '0.3', marginLeft: flag ? 'auto' : '' }}></div>}
        {pciture && <div className="skeleton-picture" style={{ width: '100%', opacity: '0.3', height: '300px' }}></div>}

        {/* <span className="msg-date">
          <div className="skeleton-line short" style={{ width: '40px', opacity: '1' }}></div>
        </span> */}
      </div>
    </div>
  );
};

export default MessageSkeleton;
