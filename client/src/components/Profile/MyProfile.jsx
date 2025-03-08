import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { LoginContext } from '../contexts/LoginContext';
import { formatNumber } from '../../utils/helperFunctions';
const MyProfile = () => {
  const { userData, domain } = useContext(LoginContext);
  const [isImageLoading, setIsImageLoading] = useState([true, true]);

  function handleImageLoad(i) {
    setIsImageLoading((prev) => {
      let demo = [...prev];
      demo[i] = false;
      return demo;
    });
  }
  return (
    <div className="side-block profile-overview">
      <figure className="profile-cover" style={{ backgroundImage: `url(${domain}/loadImage/cover/${userData.userTag})`, display: isImageLoading[1] ? 'none' : 'block' }}></figure>
      <img
        src={`${domain}/loadImage/cover/${userData.userTag}`}
        alt=""
        style={{ display: 'none' }}
        onLoad={() => {
          handleImageLoad(1);
        }}
      />
      {isImageLoading[1] && <div className="skeleton-picture cover-skele"></div>}
      <div className="pfp-container">
        <div className="pfp-wrapper" style={{ backgroundColor: 'var(--secondary-bg-color)', borderRadius: '50%', border: '4px solid var(--secondary-bg-color)' }}>
          {isImageLoading[0] && <div className="skeleton-picture" style={{ width: '80px', height: '80px', borderRadius: '50%', opacity: '1' }}></div>}
          <img
            src={`${domain}/loadImage/pfp/${userData.userTag}`}
            className="pfp"
            style={{ display: isImageLoading[0] ? 'none' : 'block' }}
            onLoad={() => {
              handleImageLoad(0);
            }}
          />
        </div>

        <h2>
          {userData.firstName} {userData.lastName}
        </h2>
        <h4 style={{ color: 'var(--text-color-glowing)' }}>{userData.userTag}</h4>
        <p>{"You've got to be kitten me!"}</p>
      </div>
      <div className="follows">
        <div className="block">
          <h1 style={{ color: 'var(--text-color-glowing)' }}>{formatNumber(userData.followingCount)}</h1>
          <h2>Following</h2>
        </div>
        <div className="block">
          <h1 style={{ color: 'var(--text-color-glowing)' }}>{formatNumber(userData.followersCount)}</h1>
          <h2>Followers</h2>
        </div>
      </div>
      <Link style={{ marginTop: 'auto', marginBottom: 'auto' }} to={`/Mewtopia/${userData.userTag}`} className="glowing-link">
        My Profile
      </Link>
    </div>
  );
};

export default MyProfile;
