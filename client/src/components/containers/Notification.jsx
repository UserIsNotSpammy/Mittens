import React, { useContext, useState } from 'react';
import { LoginContext } from '../contexts/LoginContext';
import { timeDifference } from '../../utils/helperFunctions';

const NotificationIcon = ({ action }) => {
  switch (action) {
    case 'like':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" dataname="Layer 1" viewBox="0 0 24 24" style={{ fill: 'var(--red)' }}>
          <path d="M8.164,8a2.49,2.49,0,0,1-1.579-.594A4.832,4.832,0,0,1,5.028,4.145C4.785,1.651,6.145.181,7.614.017A2.651,2.651,0,0,1,9.6.611a4.177,4.177,0,0,1,1.376,2.9C11.2,5.834,9.962,8,8.164,8ZM2.853,14a2.118,2.118,0,0,1-1.423-.594,5.041,5.041,0,0,1-1.4-3.261c-.22-2.494,1.006-3.964,2.331-4.128a2.234,2.234,0,0,1,1.786.594,4.364,4.364,0,0,1,1.241,2.9C5.589,11.834,4.359,14,2.853,14ZM15.836,8c-1.81,0-3.034-2.166-2.807-4.492h0a4.177,4.177,0,0,1,1.376-2.9A2.654,2.654,0,0,1,16.386.017c1.469.164,2.829,1.634,2.586,4.128a4.835,4.835,0,0,1-1.557,3.262A2.494,2.494,0,0,1,15.836,8Zm5.217,6c-1.886,0-2.827-2.166-2.615-4.492h0a4.3,4.3,0,0,1,1.281-2.9,2.35,2.35,0,0,1,1.846-.594c1.368.164,2.635,1.634,2.409,4.128a4.976,4.976,0,0,1-1.451,3.262A2.23,2.23,0,0,1,21.053,14ZM16,24a4.865,4.865,0,0,1-2.447-.605,3.332,3.332,0,0,0-3.106,0C7.434,25.082,3.922,23.227,4,19c0-4.636,4.507-9,8-9s8,4.364,8,9C20,21.944,18.355,24,16,24Z" />
        </svg>
      );
    case 'comment':
    case 'reply':
      return (
        <svg style={{ fill: 'white' }} xmlns="http://www.w3.org/2000/svg" id="Layer_1" dataname="Layer 1" viewBox="0 0 24 24">
          <path d="m0,0s14,10.5,24,24C15,15.5,7.5,8.5,0,0Zm23.964,14.885C18,5,9.08,0,9.08,0c5.42,6,8.42,8.5,14.885,14.885ZM0,9c6,7,9,10,15,15C8.5,15,0,9,0,9Z" />
        </svg>
      );
    case 'save':
      return (
        <svg style={{ fill: 'var(--blue)' }} xmlns="http://www.w3.org/2000/svg" id="Filled" viewBox="0 0 24 24">
          <path d="M2.849,23.55a2.954,2.954,0,0,0,3.266-.644L12,17.053l5.885,5.853a2.956,2.956,0,0,0,2.1.881,3.05,3.05,0,0,0,1.17-.237A2.953,2.953,0,0,0,23,20.779V5a5.006,5.006,0,0,0-5-5H6A5.006,5.006,0,0,0,1,5V20.779A2.953,2.953,0,0,0,2.849,23.55Z" />
        </svg>
      );
    case 'remeow':
      return (
        <svg style={{ fill: 'var(--green)' }} xmlns="http://www.w3.org/2000/svg" id="Layer_1" dataname="Layer 1" viewBox="0 0 24 24">
          <path d="M23.68,16.73l-2.59,2.41c-.54,.54-1.3,.85-2.1,.85s-1.55-.31-2.12-.88l-2.56-2.39c-.4-.38-.43-1.01-.05-1.41,.38-.4,1.01-.42,1.41-.05l2.32,2.16V9c0-1.65-1.35-3-3-3h-4c-.55,0-1-.45-1-1s.45-1,1-1h4c2.76,0,5,2.24,5,5v8.43l2.32-2.16c.4-.38,1.04-.35,1.41,.05,.38,.4,.35,1.04-.05,1.41Zm-10.68,1.27h-4c-1.65,0-3-1.35-3-3V6.57l2.32,2.16c.19,.18,.44,.27,.68,.27,.27,0,.53-.11,.73-.32,.38-.4,.35-1.04-.05-1.41l-2.56-2.39c-1.13-1.13-3.13-1.11-4.22-.02L.32,7.27c-.4,.38-.43,1.01-.05,1.41,.38,.41,1.01,.43,1.41,.05l2.32-2.16V15c0,2.76,2.24,5,5,5h4c.55,0,1-.45,1-1s-.45-1-1-1Z" />
        </svg>
      );
    case 'follow':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 512.047 512.047" style={{ enableBackground: 'new 0 0 512.047 512.047', fill: 'white' }} xmlSpace="preserve">
          <g>
            <circle cx={192} cy="128.024" r={128} />
            <path d="M192,298.69C86.015,298.82,0.129,384.705,0,490.69c0,11.782,9.551,21.333,21.333,21.333h341.333   c11.782,0,21.333-9.551,21.333-21.333C383.871,384.705,297.985,298.82,192,298.69z" />
            <path d="M469.333,168.024c-24.717,1.231-43.79,22.211-42.667,46.933c1.123-24.722-17.949-45.702-42.667-46.933   c-24.717,1.231-43.79,22.211-42.667,46.933c0,36.907,48.128,80.149,72.107,99.392c7.731,6.19,18.722,6.19,26.453,0   c23.979-19.2,72.107-62.485,72.107-99.392C513.123,190.234,494.051,169.255,469.333,168.024z" />
          </g>
        </svg>
      );
    default:
      return null;
  }
};

const NotificationMessage = ({ details }) => {
  const messageMap = {
    user: 'Followed You',
    comment: {
      like: 'Purred Your Comment',
      reply: 'Replied On Your Scratch',
    },
    post: {
      like: 'Purred Your Post',
      comment: 'Scratched Your Post',
      save: 'Saved Your Post',
      remeow: 'Remeowed Your Post',
    },
  };

  const message = details.target === 'user' ? messageMap.user : messageMap[details.target][details.action];

  return (
    <h4 className="notification-msg">
      {message}{' '}
      <div className="svg-icon-wrapper">
        <NotificationIcon action={details.action} />
      </div>
    </h4>
  );
};

const Notification = ({ details, sender, createdAt, isSeen }) => {
  const { domain } = useContext(LoginContext);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  return (
    <div className={'notification-block'}>
      {!isSeen && <div className="unseen-border"></div>}
      <div className="notification-sender-info">
        <div className="pfp-container">
          <img
            src={`${domain}/LoadImage/pfp/${sender.userTag}`}
            alt=""
            onLoad={() => {
              setIsImageLoaded(true);
            }}
            className="pfp"
            style={{ display: isImageLoaded ? 'block' : 'none' }}
          />
          {!isImageLoaded && <div className="skeleton-picture" style={{ width: '100%', height: '100%', opacity: '0.8', borderRadius: '50%' }}></div>}
        </div>
        <div className="sender-name-container">
          <h4 className="sender-name">
            {sender.firstName} {sender.lastName}
          </h4>
          <NotificationMessage details={details} />
        </div>
      </div>
      <h4 className="notifications-date">{timeDifference(createdAt)}</h4>
    </div>
  );
};

export default Notification;
