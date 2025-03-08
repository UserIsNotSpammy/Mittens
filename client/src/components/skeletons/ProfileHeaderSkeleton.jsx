import React from 'react';

const ProfileHeaderSkeleton = () => {
  return (
    <div className="side-block profile-overview-container">
      <div className="profile-cover-container">
        <figure className="profile-cover" style={{ opacity: '1' }}>
          <div className="skeleton-picture" style={{ height: '100%', opacity: '1' }}></div>
        </figure>
      </div>
      <div className="profile-info-container">
        <div className="profile-pfp-container" style={{ position: 'relative' }}>
          <div className="skeleton-picture" style={{ width: '100%', height: '100%', borderRadius: '50%', opacity: '1', backgroundColor: 'rgb(32 44 53)', animation: 'none' }}></div>
        </div>
        <div className="user-tag-container">
          <div className="skeleton-line short" style={{ width: '30%' }}></div>
          <div className="skeleton-line short" style={{ width: '20%' }}></div>
          <div className="skeleton-line long" style={{ width: '100%' }}></div>
          <div className="skeleton-line long" style={{ width: '40%' }}></div>
        </div>
        <button className="generic-button skeleton-line short" style={{ width: '100px', height: '35px' }}></button>
      </div>
      <div className="my-stuff-container">
        <div className="my-stuff-btn">
          <span className="skeleton-line short" style={{ height: '14px' }}></span>
        </div>
        <div className="my-stuff-btn">
          <span className="skeleton-line short" style={{ height: '14px' }}></span>
        </div>
        <div className="my-stuff-btn">
          <span className="skeleton-line short" style={{ height: '14px' }}></span>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeaderSkeleton;
