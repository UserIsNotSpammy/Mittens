import React from 'react';

const ChatLinkSkeleton = ({ skeletonRef = null }) => {
  return (
    <div className="chat-link" ref={skeletonRef}>
      <div className="chats-user-info-container friend-chat">
        <div className="chats-user-info-wrapper">
          <div className="pfp-container">
            <div className="skeleton-picture" style={{ width: '100%', height: '100%', borderRadius: '50%' }}></div>
          </div>
          <div className="name-tag-container">
            <div className="skeleton-line short" style={{ width: '100px' }}></div>
            <div className="skeleton-line short" style={{ width: '120px' }}></div>
          </div>
        </div>
        <div className="time-read">
          <div className="skeleton-line short" style={{ width: '50px' }}></div>
        </div>
        <div className="menu-icon-wrapper"></div>
      </div>
    </div>
  );
};

export default ChatLinkSkeleton;
