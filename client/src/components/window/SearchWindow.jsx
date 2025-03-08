import React from 'react';
import { createPortal } from 'react-dom';
import Bg from '../Auth/Bg';
const SearchWindow = ({ isVisible, onClose }) => {
  return createPortal(
    <>
      <div className={!isVisible ? 'shady-white-bg' : 'shady-white-bg visible-window'} style={!isVisible ? { transition: '0.4s 0.3s' } : {}}></div>
      <div className={!isVisible ? 'search-window' : 'search-window visible-window'} style={!isVisible ? { transition: '0.4s' } : {}} onClick={onClose}>
        <Bg></Bg>
        <div className="search-window-container"></div>
      </div>
    </>,

    document.body
  );
};

export default SearchWindow;
