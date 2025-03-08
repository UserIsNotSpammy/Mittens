import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { LoginContext } from '../contexts/LoginContext';
const SearchResult = ({ type, postedBy, post_id, postText }) => {
  const [isImageLoading, setIsImageLoading] = useState(true);
  const { domain } = useContext(LoginContext);
  return (
    <Link className="search-result" to={type === 'post' ? `/posts/${post_id}` : `/profile/${postedBy.userTag}`} style={{ textDecoration: 'none' }}>
      <div className="search-result-header">
        <div className="pfp-container">
          {isImageLoading && <div className="skeleton-picture" style={{ width: '100%', height: '100%', borderRadius: '50%', opacity: '1' }}></div>}
          <img style={{ display: isImageLoading ? 'none' : 'block' }} src={`${domain}/loadImage/pfp/${postedBy.userTag}`} alt="" className="pfp" onLoad={() => setIsImageLoading(false)} />
        </div>
        <div className="name-tag">
          <h4 className="name">
            {postedBy.firstName} {postedBy.lastName}
          </h4>
          <h4 className="tag">{postedBy.userTag}</h4>
        </div>
      </div>
      <span className="divider"></span>
      <p className="post-caption-search-result">{postText}</p>
    </Link>
  );
};

export default SearchResult;
