import React from 'react';

const LoadingScreen = ({ state }) => {
  return (
    <div className="loader-container" style={state == true ? { visibility: 'visible' } : {}}>
      <div className="spinner"></div>
    </div>
  );
};

export default LoadingScreen;
