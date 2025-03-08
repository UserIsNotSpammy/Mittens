import React from 'react';

const Formicon = (props) => {
  let makeActive = false;
  if (props.state >= props.id) {
    makeActive = true;
  }
  return (
    <li className="formicon">
      <span className={makeActive ? 'formicon-figure-container formicon-figure-container-active' : 'formicon-figure-container'}>
        <figure style={{ backgroundImage: props.img, transform: props.id == 1 ? 'scaleX(-1)' : 'scaleX(1)' }}></figure>
      </span>
      <span className={makeActive ? 'formicon-label formicon-label-active' : 'formicon-label'}>{props.label}</span>
    </li>
  );
};

export default Formicon;
