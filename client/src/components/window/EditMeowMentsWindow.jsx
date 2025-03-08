import { createPortal } from 'react-dom';
import React, { useState } from 'react';
import EditMeowMentsSlider from '../MediaPlayers/EditMeowMentsSlider';
const EditMeowMentsWindow = ({ onClose }) => {
  return createPortal(
    <div className="window-outer-container">
      <div className="side-block window edit-meowment-window">
        <h1 className="window-header">
          Edit <span>Meow</span>Ments
        </h1>
        <EditMeowMentsSlider onClose={onClose} />
      </div>
    </div>,
    document.body
  );
};

export default EditMeowMentsWindow;
