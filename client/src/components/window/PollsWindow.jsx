import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const PollsWindow = ({ onClose, onSave }) => {
  const window = useRef();
  const [polls, setPolls] = useState(['', '']);
  const [errors, setErrors] = useState([]);
  const pollData = useRef(['', '']);

  function onChange(e, i) {
    pollData.current[i] = e.target.value;
  }
  function removeOption(i) {
    pollData.current.splice(i, 1);
    const arr = [...polls];
    arr.splice(i, 1);
    setPolls([...arr]);
  }

  function addOption() {
    pollData.current.push('');
    if (polls.length > 5) return;
    const arr = [...polls, 1];
    setPolls([...arr]);
  }

  function savePoll() {
    const newErrors = [];
    const maxLength = 40;

    pollData.current.forEach((poll, i) => {
      const sanitizedPoll = poll.trim();
      if (!sanitizedPoll) {
        newErrors.push(`Option ${i + 1} cannot be empty.`);
      } else if (sanitizedPoll.length > maxLength) {
        newErrors.push(`Option ${i + 1} exceeds maximum length of ${maxLength} characters.`);
      }
      pollData.current[i] = sanitizedPoll;
    });

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors([]);
    onSave(pollData.current);
    onClose();
  }
  const Option = ({ name, index }) => {
    return (
      <div className="poll-option">
        <input
          onChange={(e) => {
            onChange(e, index);
          }}
          defaultValue={pollData.current[index]}
          type="text"
          className="poll-input"
          placeholder={name}
          style={index != 0 && index != 1 ? { paddingRight: '2.2rem' } : {}}
        />
        <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 512 512" xmlSpace="preserve" width="512" height="512">
          <g>
            <path d="M85.333,0h64c47.128,0,85.333,38.205,85.333,85.333v64c0,47.128-38.205,85.333-85.333,85.333h-64C38.205,234.667,0,196.462,0,149.333v-64C0,38.205,38.205,0,85.333,0z" />
            <path d="M362.667,0h64C473.795,0,512,38.205,512,85.333v64c0,47.128-38.205,85.333-85.333,85.333h-64c-47.128,0-85.333-38.205-85.333-85.333v-64C277.333,38.205,315.538,0,362.667,0z" />
            <path d="M85.333,277.333h64c47.128,0,85.333,38.205,85.333,85.333v64c0,47.128-38.205,85.333-85.333,85.333h-64C38.205,512,0,473.795,0,426.667v-64C0,315.538,38.205,277.333,85.333,277.333z" />
            <path d="M362.667,277.333h64c47.128,0,85.333,38.205,85.333,85.333v64C512,473.795,473.795,512,426.667,512h-64c-47.128,0-85.333-38.205-85.333-85.333v-64C277.333,315.538,315.538,277.333,362.667,277.333z" />
          </g>
        </svg>
        {/* <svg class="_3ePBnj3VLelomSpvc5bYjW _23XYJUJn_XitrV-LLkNyCQ " xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <title id="undefined-title"></title>
          <g>
            <path d="M8,2 C8.553,2 9,2.447 9,3 L9,5 C9,5.553 8.553,6 8,6 L6,6 C5.447,6 5,5.553 5,5 L5,3 C5,2.447 5.447,2 6,2 L8,2 Z M14,2 C14.553,2 15,2.447 15,3 L15,5 C15,5.553 14.553,6 14,6 L12,6 C11.447,6 11,5.553 11,5 L11,3 C11,2.447 11.447,2 12,2 L14,2 Z M8,8 C8.553,8 9,8.447 9,9 L9,11 C9,11.553 8.553,12 8,12 L6,12 C5.447,12 5,11.553 5,11 L5,9 C5,8.447 5.447,8 6,8 L8,8 Z M14,8 C14.553,8 15,8.447 15,9 L15,11 C15,11.553 14.553,12 14,12 L12,12 C11.447,12 11,11.553 11,11 L11,9 C11,8.447 11.447,8 12,8 L14,8 Z M8,14 C8.553,14 9,14.447 9,15 L9,17 C9,17.553 8.553,18 8,18 L6,18 C5.447,18 5,17.553 5,17 L5,15 C5,14.447 5.447,14 6,14 L8,14 Z M14,14 C14.553,14 15,14.447 15,15 L15,17 C15,17.553 14.553,18 14,18 L12,18 C11.447,18 11,17.553 11,17 L11,15 C11,14.447 11.447,14 12,14 L14,14 Z"></path>
          </g>
        </svg> */}
        {index != 0 && index != 1 && (
          <div
            className="discard-icon"
            style={{ visibility: 'visible' }}
            onClick={() => {
              removeOption(index);
            }}>
            {' '}
            <img src="./images/icons/trash.png" alt="Discard" />{' '}
          </div>
        )}
      </div>
    );
  };
  return createPortal(
    <div
      className="window-outer-container"
      onMouseDown={(e) => {
        if (!window.current.contains(e.target)) onClose();
      }}>
      <div className="side-block window poll-window" ref={window}>
        {/* <button
          className="close-window-icon"
          onClick={() => {
            onClose();
          }}>
          <svg clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="m12 10.93 5.719-5.72c.146-.146.339-.219.531-.219.404 0 .75.324.75.749 0 .193-.073.385-.219.532l-5.72 5.719 5.719 5.719c.147.147.22.339.22.531 0 .427-.349.75-.75.75-.192 0-.385-.073-.531-.219l-5.719-5.719-5.719 5.719c-.146.146-.339.219-.531.219-.401 0-.75-.323-.75-.75 0-.192.073-.384.22-.531l5.719-5.719-5.72-5.719c-.146-.147-.219-.339-.219-.532 0-.425.346-.749.75-.749.192 0 .385.073.531.219z" />
          </svg>
        </button> */}
        <h2 style={{ fontSize: '1.3rem', fontWeight: '600', height: 'fit-content' }}>Create a New Poll</h2>

        <div className="poll-form">
          <div className="poll-options-container">
            {polls.map((val, i) => (
              <Option name={`Option ${i + 1}`} index={i} key={Math.random() + Date.now()} />
            ))}
            <button className="add-poll-option-btn" form="" style={polls.length > 5 ? { pointerEvents: 'none', opacity: '0.23' } : {}} onClick={addOption}>
              Add Option
            </button>
          </div>

          <div className="poll-tips-wrapper">
            <div className="poll-tips-header">
              <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <g>
                  <path d="M10,8.5 C10.553,8.5 11,8.948 11,9.5 L11,13.5 C11,14.052 10.553,14.5 10,14.5 C9.447,14.5 9,14.052 9,13.5 L9,9.5 C9,8.948 9.447,8.5 10,8.5 Z M10.7002,5.79 C10.8012,5.89 10.8702,6 10.9212,6.12 C10.9712,6.24 11.0002,6.37 11.0002,6.5 C11.0002,6.57 10.9902,6.63 10.9802,6.7 C10.9712,6.76 10.9502,6.82 10.9212,6.88 C10.9002,6.94 10.8702,7 10.8302,7.05 C10.7902,7.11 10.7502,7.16 10.7002,7.21 C10.6602,7.25 10.6102,7.29 10.5512,7.33 C10.5002,7.37 10.4402,7.4 10.3812,7.42 C10.3202,7.45 10.2612,7.47 10.1902,7.48 C10.1312,7.49 10.0602,7.5 10.0002,7.5 C9.7402,7.5 9.4802,7.39 9.2902,7.21 C9.1102,7.02 9.0002,6.77 9.0002,6.5 C9.0002,6.37 9.0302,6.24 9.0802,6.12 C9.1312,5.99 9.2002,5.89 9.2902,5.79 C9.5202,5.56 9.8702,5.46 10.1902,5.52 C10.2612,5.53 10.3202,5.55 10.3812,5.58 C10.4402,5.6 10.5002,5.63 10.5512,5.67 C10.6102,5.71 10.6602,5.75 10.7002,5.79 Z M10,16 C6.691,16 4,13.309 4,10 C4,6.691 6.691,4 10,4 C13.309,4 16,6.691 16,10 C16,13.309 13.309,16 10,16 M10,2 C5.589,2 2,5.589 2,10 C2,14.411 5.589,18 10,18 C14.411,18 18,14.411 18,10 C18,5.589 14.411,2 10,2"></path>
                </g>
              </svg>
              <h4>Tips on Better Polls </h4>
            </div>

            <ol className="poll-tips-container">
              <li>Suggest short clear options </li>
              <li>The more options, the better</li>
              <li>Options can't be edited after post creation</li>
              <li>Make it public so everyone can vote</li>
            </ol>
          </div>
        </div>
        {errors.length > 0 && (
          <div id="errorsBox" style={{ display: errors.length > 0 ? 'block' : 'none' }}>
            <div className="error-message">
              <span>Please fix the following problem(s):</span>
              <ul>
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="sure-buttons-container" style={{ marginTop: '1rem' }}>
          <button
            style={{ fontSize: '14px', width: '100px' }}
            className="generic-button danger-button"
            onClick={() => {
              onClose();
            }}>
            Cancel
          </button>
          <button style={{ fontSize: '14px', width: '100px' }} className="generic-button" onClick={savePoll}>
            Save
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default PollsWindow;

{
  /* <img src="/images/errors2.png" alt="" /> */
}
