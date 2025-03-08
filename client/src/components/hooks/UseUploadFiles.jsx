import { useState, useRef, useEffect } from 'react';

const useUploadFiles = (endPoint) => {
  const [videoPreview, setVideoPreview] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [loadStatus, setLoadStatus] = useState(false);
  const [videoUploadStroke, setVideoUploadStroke] = useState([]);
  const [imageUploadStroke, setImageUploadStroke] = useState([]);
  const [errorsWindow, setErrorsWindow] = useState(null);
  const imageInputRef = useRef();
  const videoInputRef = useRef();
  const attachmentsRef = useRef([]);
  const intervalRef = useRef();
  const fileCounter = useRef(0);
  const xhrRef = useRef([]);

  useEffect(() => {
    const check = imageUploadStroke.filter((e) => {
      return !e.finished;
    });

    if (check.length === 0) setLoadStatus(false);
  }, [imageUploadStroke]);

  const previewImage = (event) => {
    const files = event.target.files;
    const invalidFiles = [];
    const largeFiles = [];
    const maxFiles = 5;

    if (files.length > maxFiles) {
      setErrorsWindow({ status: 400, message: `You can only upload up to ${maxFiles} files.` });
      return;
    }

    Array.from(files).forEach((file) => {
      if (!file.type.includes('image')) {
        invalidFiles.push(file);
      }
      if (file.size > 100 * 1024 * 1025) {
        largeFiles.push(file);
      }
    });

    if (invalidFiles.length > 0) {
      setErrorsWindow({ status: 400, message: 'Invalid file type' });
      return;
    }
    if (largeFiles.length > 0) {
      setErrorsWindow({ status: 413, message: 'One or more files are too large' });
      abort();
      return;
    }

    const blobs = Array.from(files).map((file) => URL.createObjectURL(file));

    attachmentsRef.current = [];
    uploadImage(event);
    setImagePreview(blobs);
    setVideoPreview(null);
    videoInputRef.current.value = '';
  };
  function uploadImage(e) {
    xhrRef.current = [];
    let files = e.target.files;

    for (let i = 0; i < files.length; i++) {
      if (!files[i].type.includes('image')) {
        return;
      }
    }

    for (let i = 0; i < files.length; i++) {
      fileCounter.current++;
      xhrRef.current[i] = { uploadStatus: null, xhr: null, finished: false, discarded: false };

      setLoadStatus(true);
      const xhr = new XMLHttpRequest();
      xhrRef.current[i].xhr = xhr;
      const file = new FormData();
      file.append('file', files[i]);

      xhr.open('POST', `${endPoint}/image`, true);
      xhr.withCredentials = true;

      const fullCircleStroke = 338.726;
      xhrRef.current[i].uploadStatus = fullCircleStroke;
      setImageUploadStroke([...xhrRef.current]);

      xhr.upload.onprogress = function (event) {
        // if (xhr.readyState === 0 || xhr.status === 0) {
        //   return;
        // }
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;

          const stroke = fullCircleStroke - fullCircleStroke * (percentComplete / 100);

          xhrRef.current[i].uploadStatus = stroke;
          setImageUploadStroke([...xhrRef.current]);
          // Update the stroke during progress
        } else {
          xhrRef.current[i].uploadStatus = fullCircleStroke;
          setImageUploadStroke([...xhrRef.current]);
        }
      };

      xhr.onload = function () {
        xhrRef.current[i].finished = true;
        setImageUploadStroke([...xhrRef.current]);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          if (data.status) {
            attachmentsRef.current[i] = data.message;
          }
        } else {
          setErrorsWindow({ status: xhr.status, message: xhr.responseText });
        }
      };

      xhr.onerror = function () {
        if (!intervalRef.current) {
          intervalRef.current = setInterval(() => {
            uploadImage(e);
          }, 2000);
        }
      };

      xhr.onabort = function () {};

      xhr.send(file);
    }
  }

  const previewVideo = (event) => {
    const file = event.target.files[0];
    if (file.size > 1000 * 1024 * 1024) {
      setErrorsWindow({ status: 413, message: 'File is too large' });
      abort();
      return;
    }

    const blob = URL.createObjectURL(file);
    if (file) {
      uploadVideo(event);
      setImagePreview(null);
      setVideoPreview(blob);
      //   setSendMessageWinow(true);

      imageInputRef.current.value = '';
    }
  };

  function uploadVideo(e) {
    if (!e.target.files[0].type.includes('video')) return;

    setLoadStatus(true);
    const xhr = new XMLHttpRequest();
    xhrRef.current = xhr;
    const file = new FormData();
    file.append('file', e.target.files[0]);

    xhr.open('POST', `${endPoint}/video`, true);
    xhr.withCredentials = true;

    const fullCircleStroke = 338.726;

    setVideoUploadStroke(fullCircleStroke);

    xhr.upload.onprogress = function (event) {
      if (event.lengthComputable) {
        const percentComplete = (event.loaded / event.total) * 100;

        const stroke = fullCircleStroke - fullCircleStroke * (percentComplete / 100);

        setVideoUploadStroke(stroke);
      } else {
        setVideoUploadStroke(stroke);
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
          attachmentsRef.current[0] = data.message;
        }
        setLoadStatus(false);
      } else {
        setErrorsWindow({ status: xhr.status, message: xhr.responseText });
      }
      setLoadStatus(false);
      imageInputRef.current.value = '';
      videoInputRef.current.value = '';
    };

    xhr.onerror = function () {
      // setLoadStatus(false);
      // setErrorsWindow({ status: 503, message: 'Network error' });
      if (!intervalRef.current) {
        intervalRef.current = setInterval(() => {
          uploadVideo(e);
        }, 2000);
      }
    };

    xhr.onabort = function () {
      setLoadStatus(false);
    };

    xhr.send(file);
  }

  function abort(i) {
    if (xhrRef.current[i]) {
      xhrRef.current[i].xhr.abort();
      xhrRef.current[i].finished = true;
      xhrRef.current[i].discarded = true;
      setImageUploadStroke([...xhrRef.current]);
      attachmentsRef.current[i] = null;

      videoInputRef.current.value = '';
      setVideoPreview(null);
      fileCounter.current--;

      let temp = [...imagePreview];
      temp[i] = '/';
      setImagePreview([...temp]);
    }
  }
  function discardFile(i) {
    xhrRef.current[i].discarded = true;
    xhrRef.current[i].finished = true;
    setImageUploadStroke([...xhrRef.current]);
    attachmentsRef.current[i] = null;
    fileCounter.current--;

    let temp = [...imagePreview];
    temp[i] = '/';
    setImagePreview([...temp]);
  }

  function discardVideo() {
    setVideoPreview(null);
    videoInputRef.current.value = '';
  }

  function abortVideo() {
    if (xhrRef.current) {
      xhrRef.current.abort();
      setVideoPreview(null);
      videoInputRef.current.value = '';
    }
  }

  return { previewImage, previewVideo, imagePreview, videoPreview, videoInputRef, imageInputRef, videoUploadStroke, imageUploadStroke, attachmentsRef, fileCounter, xhrRef, loadStatus, abortVideo, discardFile, discardVideo, abort, errorsWindow, setImagePreview, setLoadStatus, setVideoPreview, setErrorsWindow };
};

export default useUploadFiles;
