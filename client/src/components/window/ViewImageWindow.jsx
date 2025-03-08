import React, { useContext, useRef } from 'react';
import { createPortal } from 'react-dom';
import UseOutsideClick from '../hooks/UseOutsideClick';
const ViewImageWindow = ({ src, onClose }) => {
  const imgRef = useRef();

  UseOutsideClick(imgRef, null, () => {
    onClose();
  });
  return createPortal(
    <div className="window-outer-container view-image-window">
      <img ref={imgRef} src={src} alt="" />
    </div>,
    document.body
  );
};

export default ViewImageWindow;
