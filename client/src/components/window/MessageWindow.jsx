import React from 'react';
import { createPortal } from 'react-dom';

const MessageWindow = ({ response }) => {
  return createPortal(
    <div className="window-outer-container">
      <div className="side-block window" style={{ height: '620px' }}>
        <h2 style={{ fontSize: '1.5rem', height: 'fit-content' }}>Oopsies!</h2>
        <div className="opps-svgs-container">
          <img src="/images/errors3.png" alt="" />
          <svg className="opps-svg" xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24" width="512" height="512">
            <path d="m0,0s14.727,8.727,24,24C15.452,16.088,7.467,8.062,0,0Zm23.964,14C18.5,3.5,9.964,0,9.964,0c4.332,5.036,9.007,9.693,14,14ZM0,9c4.703,5.228,9.716,10.218,15,15C9.5,13,0,9,0,9Z" />
          </svg>
        </div>

        <span style={{ fontSize: '1.3rem', height: 'fit-content', color: 'var(--text-color-glowing)' }}>Something went wrong</span>
        <span className="reach-out-msg">If the issue persists, please contact a moderator for further assistance.</span>
        <div className="server-response-container">
          <h4 className="server-response-msg">
            Server responded with status code : <span>{response.status}</span>{' '}
          </h4>
          <span className="server-response-msg">{response.message}</span>
        </div>

        <div className="window-buttons" style={{ marginTop: 'auto' }}>
          <button
            className="generic-button"
            onClick={() => {
              window.location.reload();
            }}>
            Refresh
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default MessageWindow;
