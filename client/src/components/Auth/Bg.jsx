import React from 'react';

const Bg = () => {
  return (
    <div
      className="ultimate-bg"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundImage: "url('./images/bg.svg')",
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        opacity: '0.1',
        zIndex: -1,
        pointerEvents: 'none',
      }}></div>
  );
};

export default Bg;
