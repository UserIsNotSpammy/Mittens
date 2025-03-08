import React, { useState, useContext, useEffect, useRef } from 'react';
import ViewImageWindow from '../window/ViewImageWindow.jsx';
import { LoginContext } from '../contexts/LoginContext.jsx';
import Loader from '../Loader.jsx';

const EditMeowMentImage = ({ src, onSplice, alreadyUploaded, onfinish }) => {
  const { domain } = useContext(LoginContext);
  const [viewImageWindow, setViewImageWindow] = useState(false);
  const [loadStatus, setLoadStatus] = useState();
  const [imageUploadStroke, setImageUploadStroke] = useState();
  const [errorsWindow, setErrorsWindow] = useState(null);
  const intervalRef = useRef(null);
  const xhrRef = useRef(null);

  useEffect(() => {
    if (alreadyUploaded) return;
    uploadImage();
  }, []);

  async function blobToFile(blobUrl, fileName, mimeType) {
    const response = await fetch(blobUrl);
    const blob = await response.blob();
    return new File([blob], fileName, { type: mimeType });
  }

  async function uploadImage() {
    const formData = new FormData();
    const file = await blobToFile(src, Date.now() + '.png');
    formData.append('file', file);

    setLoadStatus(true);
    const xhr = new XMLHttpRequest();
    xhrRef.current = xhr;
    xhr.open('POST', `/api/posts/uploadAttachments/image`, true);
    xhr.withCredentials = true;
    const fullCircleStroke = 338.726;
    setImageUploadStroke(fullCircleStroke);

    xhr.upload.onprogress = function (event) {
      if (event.lengthComputable) {
        const percentComplete = (event.loaded / event.total) * 100;
        const stroke = fullCircleStroke - fullCircleStroke * (percentComplete / 100);
        setImageUploadStroke(stroke);
      } else {
        setImageUploadStroke(fullCircleStroke);
      }
    };

    xhr.onload = function () {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        if (data.status) {
          // fileNamesRef.current[index] = data.message;
          setLoadStatus(false);
          if (!alreadyUploaded) onfinish(data.message);
        }
      } else {
        setErrorsWindow({ status: xhr.status, message: xhr.responseText });
      }
    };

    xhr.onerror = function () {
      if (!intervalRef.current) {
        intervalRef.current = setInterval(() => {
          uploadImage();
        }, 2000);
      }
    };

    xhr.onabort = function () {};

    xhr.send(formData);
  }

  return (
    <>
      {viewImageWindow && <ViewImageWindow src={`${src}`} onClose={() => setViewImageWindow(false)} />}
      <div className={'swiper-slide attached-media-img-container'}>
        {!alreadyUploaded && <Loader status={loadStatus} stroke={imageUploadStroke} />}
        <div
          className="splcie-img-icon"
          onClick={() => {
            if (xhrRef.current && loadStatus) xhrRef.current.abort();
            onSplice();
          }}>
          <svg clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="m12 10.93 5.719-5.72c.146-.146.339-.219.531-.219.404 0 .75.324.75.749 0 .193-.073.385-.219.532l-5.72 5.719 5.719 5.719c.147.147.22.339.22.531 0 .427-.349.75-.75.75-.192 0-.385-.073-.531-.219l-5.719-5.719-5.719 5.719c-.146.146-.339.219-.531.219-.401 0-.75-.323-.75-.75 0-.192.073-.384.22-.531l5.719-5.719-5.72-5.719c-.146-.147-.219-.339-.219-.532 0-.425.346-.749.75-.749.192 0 .385.073.531.219z" />
          </svg>
        </div>
        <div
          className="attached-img-overlay"
          style={{
            backgroundImage: `url(${src})`,
          }}></div>
        <img className="media-img" src={`${src}`} alt="Post" />
      </div>
    </>
  );
};

export default EditMeowMentImage;
