import React, { useContext, useRef, useState, useEffect } from 'react';
import ImagePreview from '../Previews/ImagePreview';
import MessageWindow from '../window/MessageWindow';
import useUploadFiles from '../hooks/UseUploadFiles';
import VideoPreview from '../Previews/VideoPreview';
import { LoginContext } from '../contexts/LoginContext';
import { handleRequest } from '../../utils/helperFunctions';
import EmojiPicker from 'emoji-picker-react';

const CreateComment = ({ id, setComments }) => {
  const { userData, domain } = useContext(LoginContext);
  const [emoPickerWindow, setEmoPickerWindow] = useState(false);
  const [textAreaVal, setTextAreaVal] = useState('');
  const pickerRef = useRef();
  const buttonRef = useRef();

  const [postingProgress, setPostingProgress] = useState(0);
  const [isCommenting, setIscommenting] = useState(false);
  const { previewImage, previewVideo, imagePreview, videoPreview, videoInputRef, imageInputRef, videoUploadStroke, imageUploadStroke, attachmentsRef, fileCounter, xhrRef, loadStatus, abortVideo, discardFile, discardVideo, abort, errorsWindow, setImagePreview, setLoadStatus, setVideoPreview, setErrorsWindow } = useUploadFiles(`/api/posts/${id}/comments/uploadAttachments/`);

  const commentTextarea = useRef();
  const commentFetchInterval = useRef();

  const adjustHeight = () => {
    const textarea = commentTextarea.current;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  const reset = (data) => {
    attachmentsRef.current = [];
    xhrRef.current = [];
    fileCounter.current = 0;
    setImagePreview(null);
    setVideoPreview(null);
    setLoadStatus(false);

    // setAttachmentMenu(false);

    videoInputRef.current.value = '';
    imageInputRef.current.value = '';
    setTextAreaVal('');
    commentTextarea.current.style.height = 'auto';
  };
  async function addComment() {
    let text = commentTextarea.current.value;
    let body = { text: text, attachments: attachmentsRef.current || [] };
    if (!text.trim() && (!attachmentsRef.current || attachmentsRef.current.length === 0)) {
      console.log('no way');
      return;
    }
    setPostingProgress(30);
    await handleRequest(
      new Request(`/api/posts/${id}/comments/createComment`, {
        method: 'post',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: body }),
      }),
      commentFetchInterval,
      setIscommenting,
      (data) => {
        // setComments(data);
        reset();
        setPostingProgress(100);

        setTimeout(() => {
          setPostingProgress(0);
        }, 200);
      },
      null
    );
  }
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
  return (
    <>
      {errorsWindow && <MessageWindow response={errorsWindow} />}
      <div className="comment-inputs-container" style={postingProgress != 0 ? { pointerEvents: 'none', opacity: '0.4' } : {}}>
        {/* <header style={{ gap: '0.5rem', marginBottom: '0.6rem' }}>
          <img className="post-pfp" src={`${domain}/loadImage/pfp/${userData.userTag}`} style={{ width: '38px', height: '38px' }} />
          <div className="post-info">
            <h2 style={{ fontSize: '14px' }}>
              {userData.firstName} {userData.lastName}
            </h2>
          </div>
        </header> */}
        <div className="create-post-progress-bar" style={postingProgress ? { width: `${postingProgress}%` } : { width: '0%' }}></div>
        <textarea
          className="meow-textarea"
          ref={commentTextarea}
          onInput={adjustHeight}
          value={textAreaVal}
          onChange={(e) => {
            setTextAreaVal(e.target.value);
          }}
          name=""
          id="comment-textarea"
          placeholder="Write a comment"></textarea>

        {(imagePreview || videoPreview) && (
          <div className="attatchments-preview comment-preview">
            {imagePreview && <ImagePreview fileCounter={fileCounter.current} strokeVal={imageUploadStroke} onDiscard={discardFile} onAbort={abort} src={imagePreview} loadStatus={loadStatus} />}

            {videoPreview && (
              <VideoPreview
                maxHeight={230}
                strokeVal={videoUploadStroke}
                onDiscard={discardVideo}
                src={videoPreview}
                onAbort={() => {
                  abortVideo();
                }}
                loadStatus={loadStatus}
              />
            )}
          </div>
        )}
        <div className="comment-file-inputs-container" style={{ position: 'relative' }}>
          {emoPickerWindow && (
            <div ref={pickerRef} className="emo-picker-container">
              <EmojiPicker theme="dark" onEmojiClick={(emoji) => setTextAreaVal((prev) => prev + emoji.emoji)} emojiStyle="native" />
            </div>
          )}
          <div
            ref={buttonRef}
            className="comment-file-input"
            onClick={() => {
              setEmoPickerWindow((prev) => !prev);
            }}>
            {/* <figure style={{ backgroundImage: 'url("/images/icons/video.png")', filter: 'invert(100%) brightness(100%)' }}></figure> */}
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm6 14h-12c.33 1.465 2.826 4 6.001 4 3.134 0 5.665-2.521 5.999-4zm-9.5-6c-.828 0-1.5.671-1.5 1.5s.672 1.5 1.5 1.5 1.5-.671 1.5-1.5-.672-1.5-1.5-1.5zm9.5 2.002l-.755.506s-.503-.948-1.746-.948c-1.207 0-1.745.948-1.745.948l-.754-.506c.281-.748 1.205-2.002 2.499-2.002 1.295 0 2.218 1.254 2.501 2.002z" />
            </svg>
          </div>
          <label className="comment-file-input">
            <input ref={imageInputRef} type="file" accept="image/*" multiple={true} onChange={previewImage} style={{ display: 'none' }} />
            {/* <figure style={{ backgroundImage: 'url("/images/icons/photo.png")', filter: 'invert(100%) brightness(100%)' }}></figure> */}
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path d="M14 9l-2.519 4-2.481-1.96-5 6.96h16l-6-9zm8-5v16h-20v-16h20zm2-2h-24v20h24v-20zm-20 6c0-1.104.896-2 2-2s2 .896 2 2c0 1.105-.896 2-2 2s-2-.895-2-2z" />
            </svg>
          </label>
          <label className="comment-file-input">
            <input onChange={previewVideo} ref={videoInputRef} type="file" accept="video/*" style={{ display: 'none' }} />
            {/* <figure style={{ backgroundImage: 'url("/images/icons/video.png")', filter: 'invert(100%) brightness(100%)' }}></figure> */}
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path d="M16 18c0 1.104-.896 2-2 2h-12c-1.105 0-2-.896-2-2v-12c0-1.104.895-2 2-2h12c1.104 0 2 .896 2 2v12zm8-14l-6 6.223v3.554l6 6.223v-16z" />
            </svg>
          </label>

          <button className="generic-button" style={{ marginLeft: 'auto', marginRight: '10px' }} onClick={addComment}>
            Scratch
          </button>
        </div>
      </div>
    </>
  );
};

export default CreateComment;
