import React, { useContext, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import PostContent from '../FeedContent/PostContent';
import ShowMoreText from '../MediaPlayers/ShowMoreText';
import MessageWindow from './MessageWindow';
import { LoginContext } from '../contexts/LoginContext';
const RemeowWindow = ({ postType, event, poll, text, video, image, postId, postedBy, onClose, setPosts, setRemeowStatus }) => {
  const { domain, userData } = useContext(LoginContext);
  const textAreaRef = useRef();
  const [isLoading, setIsLoading] = useState(100);
  const [errors, setErrors] = useState();
  async function remeowPost(e) {
    setIsLoading(30);
    const formData = {
      text: textAreaRef.current.value,
    };
    console.log(postId);
    const request = new Request(`/api/posts/${postId}/remeow`, {
      method: 'post',
      body: JSON.stringify(formData),
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    try {
      const res = await fetch(request);

      if (!res.ok) {
        const message = await res.text();
        const error = new Error(message || `Unexpected error: ${res.status}`);
        error.status = res.status;
        throw error;
      }

      const data = await res.json();
      setPosts((prev) => [data, ...prev]);
      setIsLoading(99.9);
      setRemeowStatus(true);
      setTimeout(() => {
        onClose();
      }, 200);
    } catch (error) {
      setErrors(error);
    }
  }

  const adjustHeight = (e) => {
    const textarea = textAreaRef.current;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  return createPortal(
    <div className="window-outer-container">
      {errors && <MessageWindow response={errors} />}
      <div className="side-block window remeow-window" style={isLoading != 100 ? { minHeight: '400px', height: 'unset', pointerEvents: 'none' } : { minHeight: '400px', height: 'unset' }}>
        <div className="dim-shade" style={isLoading != 100 ? { display: 'block' } : {}}></div>
        {/* <button
          className="close-window-icon"
          onClick={() => {
            onClose();
          }}>
          <svg clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="m12 10.93 5.719-5.72c.146-.146.339-.219.531-.219.404 0 .75.324.75.749 0 .193-.073.385-.219.532l-5.72 5.719 5.719 5.719c.147.147.22.339.22.531 0 .427-.349.75-.75.75-.192 0-.385-.073-.531-.219l-5.719-5.719-5.719 5.719c-.146.146-.339.219-.531.219-.401 0-.75-.323-.75-.75 0-.192.073-.384.22-.531l5.719-5.719-5.72-5.719c-.146-.147-.219-.339-.219-.532 0-.425.346-.749.75-.749.192 0 .385.073.531.219z" />
          </svg>
        </button> */}
        <div className="create-post-progress-bar" style={isLoading != 100 ? { width: `${isLoading}%` } : { width: '0%' }}></div>
        <div className="remeow-window-heading">
          <img src="./images/icons/repost.png" alt="" />
          <h1>Remeow</h1>
        </div>

        <div className="side-block post-container">
          <header className="user-header-for-remewo">
            <img className="post-pfp" src={`${domain}/loadImage/pfp/${userData.userTag}`} />
            <div className="post-info">
              <h2>
                {userData.firstName} {userData.lastName}
              </h2>
            </div>
          </header>
          <textarea className="remeow-text-area" onChange={adjustHeight} ref={textAreaRef} placeholder="Say something about this post"></textarea>

          <div className="remeowed-post">
            <header>
              <img className="post-pfp" src={`${domain}/loadImage/pfp/${postedBy.userTag}`} />
              <div className="post-info">
                <h2>
                  {postedBy.firstName} {postedBy.lastName}
                </h2>
              </div>
            </header>
            {/* {text && <p className="post-caption">{text}</p>} */}
            <ShowMoreText text={text} charLimit={200} />
            <PostContent image={image} video={video} postType={postType} poll={poll} event={event} />
          </div>
        </div>

        <div className="sure-buttons-container" style={{ marginTop: '1rem' }}>
          <button
            style={{ fontSize: '14px', width: '100px' }}
            className="generic-button danger-button"
            onClick={() => {
              onClose();
            }}>
            Cancel
          </button>
          <button style={{ fontSize: '14px', width: '100px' }} className="generic-button" onClick={remeowPost}>
            Remeow
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default RemeowWindow;
