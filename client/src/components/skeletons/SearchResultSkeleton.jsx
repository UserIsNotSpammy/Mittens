import React from 'react';

const SearchResultSkeleton = () => {
  return (
    <div className="search-result">
      <div className="search-result-header">
        <div className="pfp-container">
          <div className="skeleton-picture" style={{ width: '100%', height: '100%', borderRadius: '50%', opacity: '1' }}></div>
        </div>
        <div className="name-tag">
          <div className="name skeleton-line"></div>
          <div className="tag skeleton-line"></div>
        </div>
      </div>
      <span className="divider"></span>
      <div style={{ width: 'calc(100% - 40px - 100px)', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        <div className="post-caption-search-result skeleton-line"></div>
        <div className="post-caption-search-result skeleton-line" style={{ width: '40px' }}></div>
      </div>
    </div>
  );
};

export default SearchResultSkeleton;
