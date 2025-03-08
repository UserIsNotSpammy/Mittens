import React, { useContext, useEffect, useRef, useState } from 'react';
import ImagePreview from '../Previews/ImagePreview.jsx';
import VideoPreview from '../Previews/VideoPreview.jsx';
import EventWindow from '../window/EventWindow.jsx';
import PollsWindow from '../window/PollsWindow';
import MessageWindow from '../window/MessageWindow.jsx';
import { LoginContext } from '../contexts/LoginContext.jsx';
import useUploadFiles from '../hooks/UseUploadFiles.jsx';
import { handleRequest } from '../../utils/helperFunctions.js';
const CreatePost = ({ setPosts }) => {
  const { userData, domain } = useContext(LoginContext);
  const { previewImage, previewVideo, imagePreview, videoPreview, videoInputRef, imageInputRef, videoUploadStroke, imageUploadStroke, attachmentsRef, fileCounter, xhrRef, loadStatus, abortVideo, discardFile, discardVideo, abort, errorsWindow, setImagePreview, setLoadStatus, setVideoPreview, setErrorsWindow } = useUploadFiles('/api/posts/uploadAttachments');

  const [postCaption, setPostCaption] = useState(null);

  const [polls, setPolls] = useState(false);
  const [event, setEvent] = useState(null);
  const [postingStatus, setPostingStatus] = useState(false);
  const [postingProgress, setPostingProgress] = useState(0);

  const [eventWindow, setEventWindow] = useState(false);
  const [pollsWindow, setPollsWindow] = useState(false);

  // const intervalRef = useRef(null);
  const addPostIntervalRef = useRef(null);
  const postTextarea = useRef();

  useEffect(() => {
    const check = imageUploadStroke.filter((e) => {
      return !e.finished;
    });

    if (check.length === 0) setLoadStatus(false);
  }, [imageUploadStroke]);

  const reset = (data) => {
    attachmentsRef.current = [];
    xhrRef.current = [];
    fileCounter.current = 0;
    setImagePreview(null);
    setVideoPreview(null);
    setPostCaption(null);
    setLoadStatus(false);
    setEvent(null);
    setPolls(null);
    setTimeout(() => {
      setPostingStatus(false);
    }, 200);

    setPostingProgress(0);
    postTextarea.current.value = '';
    videoInputRef.current.value = '';
    imageInputRef.current.value = '';

    if (data) setPosts((prev) => [data, ...prev]);
  };
  const adjustHeight = (e) => {
    const textarea = postTextarea.current;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
    setPostCaption(e.target.value);
  };

  async function addPost(e) {
    e.preventDefault();
    const formData = {
      postText: postTextarea.current.value.trim(),
    };
    const findAttachemnt = attachmentsRef.current.find((v) => v != null);
    if (event) {
      formData.event = event;
    } else if (findAttachemnt) {
      const attachments = attachmentsRef.current.filter((val) => val != null);
      formData.attachments = attachments;
    } else if (polls) {
      formData.poll = polls;
    }

    if (!formData.postText && !formData.attachments && !formData.event && !formData.poll) return;

    setPostingProgress(30);

    await handleRequest(
      new Request(`/api/posts/createPost`, {
        method: 'post',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      }),
      addPostIntervalRef,
      setPostingStatus,
      (data) => {
        setPostingProgress(100);
        setTimeout(() => {
          reset(data);
        }, 500);
      },
      setErrorsWindow
    );

    // const request = new Request(`/api/posts/createPost`, {
    //   method: 'post',
    //   credentials: 'same-origin',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(formData),
    // });
    // try {
    //   if (addPostIntervalRef.current) {
    //     clearInterval(addPostIntervalRef.current);
    //     addPostIntervalRef.current = null;
    //   }
    //   const res = await fetch(request);

    //   if (!res.ok) {
    //     const message = await res.text();
    //     const error = new Error(message || `Unexpected error: ${res.status}`);
    //     error.status = res.status;
    //     throw error;
    //   }

    //   const data = await res.json();
    //   setPostingProgress(100);
    //   setTimeout(() => {
    //     reset(data);
    //   }, 500);
    // } catch (err) {
    //   if (err.message === 'Failed to fetch') {
    //     if (!addPostIntervalRef.current) {
    //       addPostIntervalRef.current = setInterval(() => {
    //         addPost(e);
    //       }, 2000);
    //     }
    //   } else {
    //     setErrorsWindow({ status: err.status, message: err.message });
    //   }
    // }
  }

  const PostType = ({ icon, type, style, children, onClick }) => (
    <>
      <label htmlFor={type} className="post-type" onClick={onClick}>
        <figure style={{ backgroundImage: icon, filter: style }}></figure>
        <span>{type}</span>
      </label>
      {children}
    </>
  );

  function handleDrop(e) {
    e.preventDefault();

    const files = Array.from(e.dataTransfer.files);
    console.log(files);

    const blobs = files.map((file) => URL.createObjectURL(file));
    setImagePreview(blobs);
  }
  return (
    <>
      {eventWindow && (
        <EventWindow
          second_time_display={eventWindow}
          onClose={() => {
            setEventWindow(false);
          }}
          setEvent={setEvent}
        />
      )}
      {pollsWindow && (
        <PollsWindow
          onClose={() => {
            setPollsWindow(false);
          }}
          onSave={(data) => {
            setPolls(data);
            setEvent(null);
            attachmentsRef.current = [];
            setImagePreview(null);
            setVideoPreview(null);
          }}
        />
      )}
      {errorsWindow && (
        <MessageWindow
          onClose={() => {
            setErrorsWindow(false);
          }}
          response={errorsWindow}
        />
      )}

      <div className="side-block create-post" style={postingStatus ? { opacity: '0.7', pointerEvents: 'none' } : {}} onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
        <div className="create-post-progress-bar" style={postingProgress ? { width: `${postingProgress}%` } : { width: '0%' }}></div>
        <div className="thoughts">
          <figure className="pfp" style={{ backgroundImage: `url(${domain}/LoadImage/pfp/${userData.userTag})` }}></figure>
          <label
            onClick={() => {
              setPostCaption(true);
            }}
            htmlFor="post-textarea"
            className="searchBar post-bar">
            What's on your mind
          </label>
          <button className="generic-button post-btn" form="create_post_form" style={loadStatus ? { pointerEvents: 'none', opacity: '0.4' } : {}}>
            Meow
          </button>
        </div>

        <div style={(postCaption && postCaption != '') || videoPreview || imagePreview || event || polls ? { display: 'flex' } : { display: 'none' }} className="attatchments-preview">
          <textarea onChange={adjustHeight} ref={postTextarea} name="" placeholder="What's on your mind?" className="meow-textarea post-textarea" id="post-textarea"></textarea>
          {videoPreview && (
            <VideoPreview
              maxHeight={600}
              strokeVal={videoUploadStroke}
              onDiscard={discardVideo}
              src={videoPreview}
              onAbort={() => {
                abortVideo();
              }}
              loadStatus={loadStatus}
            />
          )}
          {imagePreview && <ImagePreview fileCounter={fileCounter.current} strokeVal={imageUploadStroke} onDiscard={discardFile} onAbort={abort} src={imagePreview} loadStatus={loadStatus} />}

          {event && (
            <div className="post-event">
              <div
                className="discard-icon"
                onClick={() => {
                  setEvent(null);
                }}>
                <img src="/images/icons/trash.png" alt="Discard" />
              </div>
              <h2 style={{ opacity: '0.6' }}>EVENT</h2>
              <h1 style={{ fontWeight: 'bold' }}>{event.name}</h1>
              <div className="event-info">
                <svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24" width="15" height="15">
                  <path d="M12,0C5.383,0,0,5.383,0,12s5.383,12,12,12,12-5.383,12-12S18.617,0,12,0Zm4,13h-4c-.552,0-1-.447-1-1V6c0-.553,.448-1,1-1s1,.447,1,1v5h3c.553,0,1,.447,1,1s-.447,1-1,1Z" />
                </svg>

                <span>{event.time}</span>
              </div>
              <div className="event-info">
                <svg xmlns="http://www.w3.org/2000/svg" id="Filled" viewBox="0 0 24 24" width="15" height="15">
                  <path d="M0,19a5.006,5.006,0,0,0,5,5H19a5.006,5.006,0,0,0,5-5V10H0Zm17-4.5A1.5,1.5,0,1,1,15.5,16,1.5,1.5,0,0,1,17,14.5Zm-5,0A1.5,1.5,0,1,1,10.5,16,1.5,1.5,0,0,1,12,14.5Zm-5,0A1.5,1.5,0,1,1,5.5,16,1.5,1.5,0,0,1,7,14.5Z" />
                  <path d="M19,2H18V1a1,1,0,0,0-2,0V2H8V1A1,1,0,0,0,6,1V2H5A5.006,5.006,0,0,0,0,7V8H24V7A5.006,5.006,0,0,0,19,2Z" />
                </svg>
                <span>{event.date}</span>
              </div>
              <div className="event-info">
                <svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24" width="15" height="15">
                  <path d="M12,0A10.011,10.011,0,0,0,2,10c0,5.282,8.4,12.533,9.354,13.343l.646.546.646-.546C13.6,22.533,22,15.282,22,10A10.011,10.011,0,0,0,12,0Zm0,15a5,5,0,1,1,5-5A5.006,5.006,0,0,1,12,15Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <a className="event-link" target="blank" href={event.location.link}>
                  {event.location.name}
                </a>
              </div>
            </div>
          )}
          {polls && (
            <div className="polls-create-post-container">
              <div
                className="discard-icon"
                onClick={() => {
                  setPolls(false);
                }}>
                <img src="/images/icons/trash.png" alt="Discard" />
              </div>
              {polls.map((value, i) => (
                // <div className="poll-option" key={i}>
                //   <span className="poll-input"> {value} </span>
                //   <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 512 512" xmlSpace="preserve" width="512" height="512">
                //     <g>
                //       <path d="M85.333,0h64c47.128,0,85.333,38.205,85.333,85.333v64c0,47.128-38.205,85.333-85.333,85.333h-64C38.205,234.667,0,196.462,0,149.333v-64C0,38.205,38.205,0,85.333,0z" />
                //       <path d="M362.667,0h64C473.795,0,512,38.205,512,85.333v64c0,47.128-38.205,85.333-85.333,85.333h-64c-47.128,0-85.333-38.205-85.333-85.333v-64C277.333,38.205,315.538,0,362.667,0z" />
                //       <path d="M85.333,277.333h64c47.128,0,85.333,38.205,85.333,85.333v64c0,47.128-38.205,85.333-85.333,85.333h-64C38.205,512,0,473.795,0,426.667v-64C0,315.538,38.205,277.333,85.333,277.333z" />
                //       <path d="M362.667,277.333h64c47.128,0,85.333,38.205,85.333,85.333v64C512,473.795,473.795,512,426.667,512h-64c-47.128,0-85.333-38.205-85.333-85.333v-64C277.333,315.538,315.538,277.333,362.667,277.333z" />
                //     </g>
                //   </svg>
                // </div>
                <label className="poll-option poll-option-posted" key={i} style={{ border: '1px solid rgba(225, 225, 225, 0.1)' }}>
                  <div className="poll-option-header">
                    <span className="custom-radio-checkmark"></span>
                    <h2>{value}</h2>
                    <h3>{`0%`}</h3>
                  </div>
                  <div className="vote-precentage-container">
                    <div className="vote-precentage" style={{ width: `0%` }}></div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>
        <form id="create_post_form" className="post-types-container" onSubmit={addPost} encType="multipart/form-data" style={loadStatus ? { pointerEvents: 'none', opacity: '0.4' } : {}}>
          <PostType style="invert(81%) sepia(64%) saturate(571%) hue-rotate(88deg) brightness(89%) contrast(92%)" type="Image" icon="url(/images/icons/photo.png)">
            <input
              accept="image/*"
              ref={imageInputRef}
              type="file"
              name="postImage"
              onChange={(e) => {
                previewImage(e);
              }}
              id="Image"
              style={{ display: 'none' }}
              multiple
            />
          </PostType>

          <PostType style="invert(47%) sepia(91%) saturate(2600%) hue-rotate(199deg) brightness(102%) contrast(86%)" type="Video" icon="url(/images/icons/video.png)">
            <input
              accept={`video/*`}
              ref={videoInputRef}
              type="file"
              name="postVideo"
              onChange={(e) => {
                previewVideo(e);
                uploadVideo(e);
              }}
              id="Video"
              style={{ display: 'none' }}
            />
          </PostType>
          <PostType
            style="invert(82%) sepia(25%) saturate(3618%) hue-rotate(314deg) brightness(91%) contrast(98%)"
            type="Poll"
            icon="url(/images/icons/poll.png)"
            onClick={() => {
              setPollsWindow(true);
            }}
          />

          <PostType
            style="invert(58%) sepia(82%) saturate(1976%) hue-rotate(317deg) brightness(100%) contrast(104%)"
            type="Event"
            icon="url(/images/icons/calendar.png)"
            onClick={() => {
              setEventWindow(true);
            }}
          />
          {/* <PostType style="invert(82%) sepia(98%) saturate(3618%) hue-rotate(314deg) brightness(91%) contrast(98%)" type="Activity" icon="url(/images/icons/activity.png)" /> */}
        </form>
      </div>
    </>
  );
};

export default CreatePost;
