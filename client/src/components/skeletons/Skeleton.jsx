import React from 'react';

const Skeleton = ({ type, Ref, withPciture }) => {
  return (
    <div className={`skeleton-container ${type}`} ref={Ref}>
      <div className="user-pfp-skelton-container">
        <div className="skeleton-circle"></div>
        <div className="short-lines-container">
          <div className="skeleton-line short"></div>
          <div className="skeleton-line short"></div>
        </div>
      </div>

      <div className="skeleton-content">
        <div className="skeleton-line long"></div>
        <div className="skeleton-line long"></div>
      </div>
      {withPciture && <div className="skeleton-picture"></div>}
    </div>
  );
};

export default Skeleton;
