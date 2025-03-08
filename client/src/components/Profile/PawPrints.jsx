import React, { useContext, useEffect } from 'react';
import PawPrintCard from './PawPrintCard';
import { ProfileDataContext } from '../contexts/ProfileDataContext';
const PawPrints = () => {
  const skeleton = Array(6).fill(0);
  const { isFetching, fetchedUserData } = useContext(ProfileDataContext);
  const { pawprints } = fetchedUserData || {};

  return (
    <div className="side-block side-profile-containers pawprints-container">
      <svg className="pawprints-bg pawprint-1" xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24">
        <path d="M8.164,8a2.49,2.49,0,0,1-1.579-.594A4.832,4.832,0,0,1,5.028,4.145C4.785,1.651,6.145.181,7.614.017A2.651,2.651,0,0,1,9.6.611a4.177,4.177,0,0,1,1.376,2.9C11.2,5.834,9.962,8,8.164,8ZM2.853,14a2.118,2.118,0,0,1-1.423-.594,5.041,5.041,0,0,1-1.4-3.261c-.22-2.494,1.006-3.964,2.331-4.128a2.234,2.234,0,0,1,1.786.594,4.364,4.364,0,0,1,1.241,2.9C5.589,11.834,4.359,14,2.853,14ZM15.836,8c-1.81,0-3.034-2.166-2.807-4.492h0a4.177,4.177,0,0,1,1.376-2.9A2.654,2.654,0,0,1,16.386.017c1.469.164,2.829,1.634,2.586,4.128a4.835,4.835,0,0,1-1.557,3.262A2.494,2.494,0,0,1,15.836,8Zm5.217,6c-1.886,0-2.827-2.166-2.615-4.492h0a4.3,4.3,0,0,1,1.281-2.9,2.35,2.35,0,0,1,1.846-.594c1.368.164,2.635,1.634,2.409,4.128a4.976,4.976,0,0,1-1.451,3.262A2.23,2.23,0,0,1,21.053,14ZM16,24a4.865,4.865,0,0,1-2.447-.605,3.332,3.332,0,0,0-3.106,0C7.434,25.082,3.922,23.227,4,19c0-4.636,4.507-9,8-9s8,4.364,8,9C20,21.944,18.355,24,16,24Z" />
      </svg>
      {/* <svg className="pawprints-bg pawprint-2" xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24">
        <path d="M8.164,8a2.49,2.49,0,0,1-1.579-.594A4.832,4.832,0,0,1,5.028,4.145C4.785,1.651,6.145.181,7.614.017A2.651,2.651,0,0,1,9.6.611a4.177,4.177,0,0,1,1.376,2.9C11.2,5.834,9.962,8,8.164,8ZM2.853,14a2.118,2.118,0,0,1-1.423-.594,5.041,5.041,0,0,1-1.4-3.261c-.22-2.494,1.006-3.964,2.331-4.128a2.234,2.234,0,0,1,1.786.594,4.364,4.364,0,0,1,1.241,2.9C5.589,11.834,4.359,14,2.853,14ZM15.836,8c-1.81,0-3.034-2.166-2.807-4.492h0a4.177,4.177,0,0,1,1.376-2.9A2.654,2.654,0,0,1,16.386.017c1.469.164,2.829,1.634,2.586,4.128a4.835,4.835,0,0,1-1.557,3.262A2.494,2.494,0,0,1,15.836,8Zm5.217,6c-1.886,0-2.827-2.166-2.615-4.492h0a4.3,4.3,0,0,1,1.281-2.9,2.35,2.35,0,0,1,1.846-.594c1.368.164,2.635,1.634,2.409,4.128a4.976,4.976,0,0,1-1.451,3.262A2.23,2.23,0,0,1,21.053,14ZM16,24a4.865,4.865,0,0,1-2.447-.605,3.332,3.332,0,0,0-3.106,0C7.434,25.082,3.922,23.227,4,19c0-4.636,4.507-9,8-9s8,4.364,8,9C20,21.944,18.355,24,16,24Z" />
      </svg>
      <svg className="pawprints-bg pawprint-3" xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24">
        <path d="M8.164,8a2.49,2.49,0,0,1-1.579-.594A4.832,4.832,0,0,1,5.028,4.145C4.785,1.651,6.145.181,7.614.017A2.651,2.651,0,0,1,9.6.611a4.177,4.177,0,0,1,1.376,2.9C11.2,5.834,9.962,8,8.164,8ZM2.853,14a2.118,2.118,0,0,1-1.423-.594,5.041,5.041,0,0,1-1.4-3.261c-.22-2.494,1.006-3.964,2.331-4.128a2.234,2.234,0,0,1,1.786.594,4.364,4.364,0,0,1,1.241,2.9C5.589,11.834,4.359,14,2.853,14ZM15.836,8c-1.81,0-3.034-2.166-2.807-4.492h0a4.177,4.177,0,0,1,1.376-2.9A2.654,2.654,0,0,1,16.386.017c1.469.164,2.829,1.634,2.586,4.128a4.835,4.835,0,0,1-1.557,3.262A2.494,2.494,0,0,1,15.836,8Zm5.217,6c-1.886,0-2.827-2.166-2.615-4.492h0a4.3,4.3,0,0,1,1.281-2.9,2.35,2.35,0,0,1,1.846-.594c1.368.164,2.635,1.634,2.409,4.128a4.976,4.976,0,0,1-1.451,3.262A2.23,2.23,0,0,1,21.053,14ZM16,24a4.865,4.865,0,0,1-2.447-.605,3.332,3.332,0,0,0-3.106,0C7.434,25.082,3.922,23.227,4,19c0-4.636,4.507-9,8-9s8,4.364,8,9C20,21.944,18.355,24,16,24Z" />
      </svg> */}
      <div className="friends-container">
        <div className="friends-container-header">
          <div className="friends-counter">
            <h1 style={{ fontSize: '17px', color: 'white' }}>
              <span style={{ color: 'var(--text-color-glowing)' }}>Paw</span>Prints
            </h1>
            <h3 style={{ fontSize: '12px' }}>Latest PawPrints</h3>
          </div>
          <div className="cat-toy-img" style={{ backgroundImage: 'url(/images/icons/mooncat.png)', transform: 'rotate(0deg) scaleX(-1)' }}></div>
        </div>
      </div>
      <div className="pawprints-wrapper">
        {!isFetching &&
          Array.isArray(pawprints) &&
          pawprints.map((pawprint, index) => {
            return <PawPrintCard key={index} type={pawprint.type} target={pawprint.target} createdAt={pawprint.createdAt} />;
          })}
        {isFetching &&
          skeleton.map((i) => (
            <div className="skeleton-group-wrapper" key={Date.now() + Math.random()}>
              <div className="skeleton-picture"></div>
              <div className="skeleton-group">
                <div className="skeleton-line short" style={{ opacity: 1, width: '90%', height: '10px' }}></div>
                <div className="skeleton-line short" style={{ opacity: 1, width: '30%', height: '10px' }}></div>
              </div>
            </div>
          ))}
      </div>
    </div>
    // <div className="side-block side-profile-containers"></div>
  );
};

export default PawPrints;
