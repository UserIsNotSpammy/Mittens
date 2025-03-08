import React, { useRef, useState } from 'react';
import { useContext } from 'react';
import { LoginContext } from './contexts/LoginContext';
import { Link } from 'react-router-dom';
import { throwError } from '../utils/helperFunctions';

const User = ({ firstName, lastName, userTag, isFollowed }) => {
  const { domain } = useContext(LoginContext);
  const [followed, setFollowed] = useState(isFollowed);
  const [isLoading, setIsLoading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const followInterval = useRef(null);

  async function handleFollow(shouldFollow) {
    setIsLoading(true);
    const endpoint = shouldFollow ? 'follow' : 'unfollow';
    const req = new Request(`/api/users/${userTag}/${endpoint}`, { method: 'post', credentials: 'same-origin' });
    try {
      let res;
      try {
        res = await fetch(req);
      } catch {
        throwError('internet connection failure', 503);
      }
      if (!res.ok) throwError((await res.text()) || 'Unknown error occurred', res.status || 500);
      setFollowed(shouldFollow);
      setIsLoading(false);
    } catch (err) {
      if (err.status === 503 && err.message === 'internet connection failure') {
        if (!followInterval.current) {
          followInterval.current = setInterval(() => {
            handleFollow(shouldFollow);
          }, 3000);
        }
      } else {
        clearInterval(followInterval.current);
        followInterval.current = null;
        setIsLoading(false);
      }
    }
  }

  const handleImageLoad = () => {
    setIsImageLoading(false);
  };

  return (
    <div className="user-container" style={isLoading ? { pointerEvents: 'none' } : {}}>
      {isImageLoading && <div className="skeleton-picture" style={{ width: '55px', height: '55px', borderRadius: '50%' }}></div>}
      <img className="user-pfp" src={`${domain}/loadImage/pfp/${userTag}`} alt={`${firstName} ${lastName}`} onLoad={handleImageLoad} style={isImageLoading ? { display: 'none' } : {}} />
      <div className="user-info" style={{ marginInline: '15px' }}>
        <Link to={`/Mewtopia/${userTag}`}>
          {firstName} {lastName}
        </Link>
        <h4>{userTag}</h4>
      </div>
      {!followed && (
        <button style={{ marginLeft: 'auto', opacity: isLoading ? '0.5' : '1' }} className="generic-button" onClick={() => handleFollow(true)}>
          Follow
        </button>
      )}
      {followed && (
        <button style={{ marginLeft: 'auto', opacity: isLoading ? '0.5' : '1' }} className="generic-button cancel-btn" onClick={() => handleFollow(false)}>
          Unfollow
        </button>
      )}
    </div>
  );
};

export default User;
