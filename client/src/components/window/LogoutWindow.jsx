import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { handleRequest } from '../../utils/helperFunctions';
import MessageWindow from './MessageWindow';
import { useContext } from 'react';
import { LoginContext } from '../contexts/LoginContext';
const LogoutWindow = ({ onClose }) => {
  const { setUserData, setIsLoggedIn } = useContext(LoginContext);
  const windowRef = useRef();
  const [isLoading, setIsloading] = useState(false);
  const [errors, setErrors] = useState(null);
  const intervalRef = useRef();

  async function logout() {
    await handleRequest(
      new Request('/api/auth/logout', {
        method: 'post',
        credentials: 'same-origin',
      }),
      intervalRef,
      setIsloading,
      (data) => {
        setIsLoggedIn(false);
        setUserData(null);
      },
      (err) => {
        setErrors(errors);
      }
    );
  }
  return createPortal(
    <>
      {errors && <MessageWindow response={errors} />}
      <div className="window-outer-container">
        <div className="side-block window" ref={windowRef} style={{ height: 'fit-content', width: '370px' }}>
          <div className="warning-msg-container">
            <svg className="warning-icon" xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24">
              <path d="M23.08,15.33L15,2.57c-.68-.98-1.81-1.57-3-1.57s-2.32,.58-3.03,1.6L.93,15.31c-1.02,1.46-1.21,3.21-.5,4.56,.7,1.35,2.17,2.12,4.01,2.12h15.12c1.85,0,3.31-.77,4.01-2.12,.7-1.35,.51-3.09-.49-4.54ZM11,7c0-.55,.45-1,1-1s1,.45,1,1v6c0,.55-.45,1-1,1s-1-.45-1-1V7Zm1,12c-.83,0-1.5-.67-1.5-1.5s.67-1.5,1.5-1.5,1.5,.67,1.5,1.5-.67,1.5-1.5,1.5Z" />
            </svg>

            <h1 style={{ fontSize: '18px', margin: 'auto 0px' }}>Logout</h1>
            <h2>Are you sure you want to logout?</h2>
          </div>

          <div className="sure-buttons-container" style={isLoading ? { pointerEvents: 'none', opacity: '0.3' } : {}}>
            <button
              className="generic-button"
              onClick={() => {
                onClose();
              }}>
              Cancel
            </button>
            <button className="generic-button danger-button" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

export default LogoutWindow;
