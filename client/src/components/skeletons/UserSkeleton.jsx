import React from 'react';

const UserSkeleton = () => {
  return (
    <div className="user-container skeleton-user-container">
      <div className="user-pfp-skelton"></div>
      <div className="user-info" style={{ marginInline: '15px' }}>
        <h3 className="skeleton-line short"></h3>
        <h4 className="skeleton-line long"></h4>
      </div>
      <button style={{ marginLeft: 'auto' }} className="generic-button">
        <h3 className="skeleton-line short" style={{ width: '100%', height: '20px' }}></h3>
      </button>
    </div>
  );
};

export default UserSkeleton;
