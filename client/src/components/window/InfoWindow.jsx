import React from 'react';
import { createPortal } from 'react-dom';
import { formatDate } from '../../utils/helperFunctions';
const InfoWindow = ({ dataToDisplay, onClose, type }) => {
  const InfoBlock = ({ data }) => {
    return (
      <div className="info-block">
        <div className="info-block-header">
          <h1>{data.header}</h1>
          <span>
            <svg xmlns="http://www.w3.org/2000/svg" id="Outline" viewBox="0 0 24 24">
              <path d="M13.1,19a1,1,0,0,1-.7-1.71L17,12.71a1,1,0,0,0,0-1.42L12.4,6.71a1,1,0,0,1,0-1.42,1,1,0,0,1,1.41,0L18.4,9.88a3,3,0,0,1,0,4.24l-4.59,4.59A1,1,0,0,1,13.1,19Z" />
              <path d="M6.1,19a1,1,0,0,1-.7-1.71L10.69,12,5.4,6.71a1,1,0,0,1,0-1.42,1,1,0,0,1,1.41,0l6,6a1,1,0,0,1,0,1.42l-6,6A1,1,0,0,1,6.1,19Z" />
            </svg>
          </span>
        </div>
        <h1 className="info-block-value" style={data.header == 'Post Id' || data.header == 'Comment Id' ? { fontSize: '0.7rem' } : {}}>
          {data.value}
        </h1>
      </div>
    );
  };
  return createPortal(
    <div className="window-outer-container">
      <div className="side-block window" style={{ height: 'fit-content', width: '500px' }}>
        <h1>General Info</h1>
        <button
          className="close-window-icon"
          onClick={() => {
            onClose();
          }}>
          <svg clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="m12 10.93 5.719-5.72c.146-.146.339-.219.531-.219.404 0 .75.324.75.749 0 .193-.073.385-.219.532l-5.72 5.719 5.719 5.719c.147.147.22.339.22.531 0 .427-.349.75-.75.75-.192 0-.385-.073-.531-.219l-5.719-5.719-5.719 5.719c-.146.146-.339.219-.531.219-.401 0-.75-.323-.75-.75 0-.192.073-.384.22-.531l5.719-5.719-5.72-5.719c-.146-.147-.219-.339-.219-.532 0-.425.346-.749.75-.749.192 0 .385.073.531.219z" />
          </svg>
        </button>
        <div className="info-container">
          {dataToDisplay.map((data) => {
            return <InfoBlock data={data} />;
          })}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default InfoWindow;
