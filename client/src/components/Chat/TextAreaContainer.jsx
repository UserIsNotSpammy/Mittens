import React, { useState, useRef, useEffect } from 'react';
import EmojiPicker from 'emoji-picker-react';

const TextAreaContainer = ({ onSend, chatContainerRef, placeholder, inputFieldContainerRef }) => {
  const [emoPickerWindow, setEmoPickerWindow] = useState(false);
  const [textAreaVal, setTextAreaVal] = useState('');
  const pickerRef = useRef(null);
  const textAreaRef = useRef();
  const buttonRef = useRef();
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target) && !buttonRef.current.contains(event.target)) {
        setEmoPickerWindow(false);
      }
    };

    if (emoPickerWindow) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [emoPickerWindow]);
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault(); // Prevents a new line from being added
        onSend(textAreaRef.current.value, () => {
          setEmoPickerWindow(false);
          setTextAreaVal('');
          textAreaRef.current.value = '';
        });
      }
    }

    const textarea = textAreaRef.current;
    if (textarea) {
      textarea.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      if (textarea) {
        textarea.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, []);
  const adjustHeight = (e, flag) => {
    const textarea = e.target;
    if (textarea) {
      textarea.style.height = '20px';

      const newHeight = Math.min(textarea.scrollHeight, 120);
      textarea.style.height = `${newHeight}px`;

      if (chatContainerRef.current && inputFieldContainerRef.current && flag) {
        chatContainerRef.current.style.height = `calc(100% - 75px - ${window.getComputedStyle(inputFieldContainerRef.current).height})`;
      }
    }
  };

  return (
    <>
      <div className="chat-text-area-container">
        <div
          ref={buttonRef}
          className="emoji-picker-container"
          onClick={() => {
            setEmoPickerWindow((prev) => !prev);
          }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm6 14h-12c.33 1.465 2.826 4 6.001 4 3.134 0 5.665-2.521 5.999-4zm-9.5-6c-.828 0-1.5.671-1.5 1.5s.672 1.5 1.5 1.5 1.5-.671 1.5-1.5-.672-1.5-1.5-1.5zm9.5 2.002l-.755.506s-.503-.948-1.746-.948c-1.207 0-1.745.948-1.745.948l-.754-.506c.281-.748 1.205-2.002 2.499-2.002 1.295 0 2.218 1.254 2.501 2.002z" />
          </svg>
        </div>
        <textarea
          value={textAreaVal}
          ref={textAreaRef}
          onInput={(e) => {
            adjustHeight(e, true);
          }}
          onChange={(e) => {
            setTextAreaVal(e.target.value);
          }}
          placeholder="Write A Message"
        />

        {emoPickerWindow && (
          <div ref={pickerRef} className="emo-picker-container">
            <EmojiPicker theme="dark" onEmojiClick={(emoji) => setTextAreaVal((prev) => prev + emoji.emoji)} emojiStyle="native" />
          </div>
        )}
      </div>

      <div
        className="chat-icon-container"
        onClick={() => {
          onSend(textAreaRef.current.value, () => {
            setEmoPickerWindow(false);
            setTextAreaVal('');
            textAreaRef.current.value = '';
          });
        }}>
        <svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" dataname="Layer 1" viewBox="0 0 24 24">
          <path d="m.172,3.708C-.216,2.646.076,1.47.917.713,1.756-.041,2.951-.211,3.965.282l18.09,8.444c.97.454,1.664,1.283,1.945,2.273H4.048L.229,3.835c-.021-.041-.04-.084-.057-.127Zm3.89,9.292L.309,20.175c-.021.04-.039.08-.054.122-.387,1.063-.092,2.237.749,2.993.521.467,1.179.708,1.841.708.409,0,.819-.092,1.201-.279l18.011-8.438c.973-.456,1.666-1.288,1.945-2.28H4.062Z" />
        </svg>
      </div>
    </>
  );
};
export default TextAreaContainer;
