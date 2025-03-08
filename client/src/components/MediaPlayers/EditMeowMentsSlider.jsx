import React, { useRef, useEffect, useState, useContext } from 'react';
import Swiper from 'swiper/bundle';
import { ProfileDataContext } from '../contexts/ProfileDataContext.jsx';
import { LoginContext } from '../contexts/LoginContext.jsx';
import EditMeowMentImage from './EditMeowMentImage.jsx';
import { handleRequest } from '../../utils/helperFunctions.js';

const EditMeowMentsSlider = ({ onClose }) => {
  const swiperContainerRef = useRef(null);
  const swiperPaginationRef = useRef(null);
  const swiperNextRef = useRef(null);
  const swiperPrevRef = useRef(null);
  const actualSwiperRef = useRef();
  const { fetchedUserData, setFetchedUserData } = useContext(ProfileDataContext);
  const { userData, domain } = useContext(LoginContext);
  const [images, setImages] = useState(fetchedUserData?.meowments?.map((img) => `${domain}/LoadMeowment/${fetchedUserData.userTag}/${img.fileName}`) || []);
  const [newImages, setNewImages] = useState([]);
  const [errorsWindow, setErrorsWindow] = useState(null);
  const fetchIntervalRef = useRef(null);
  const imageInputRef = useRef();
  const fileNamesRef = useRef(fetchedUserData?.meowments?.map((img) => img.fileName) || []);
  const newFileNamesRef = useRef([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (swiperContainerRef.current && swiperNextRef.current && swiperPrevRef.current && swiperPaginationRef.current) {
      actualSwiperRef.current = new Swiper(swiperContainerRef.current, {
        spaceBetween: 30,
        slidesPerView: 1,
        autoplay: false,
        grabCursor: true,
        navigation: {
          nextEl: swiperNextRef.current,
          prevEl: swiperPrevRef.current,
        },
        pagination: {
          el: swiperPaginationRef.current,
          clickable: true,
        },
        effect: 'coverflow',
      });

      return () => {
        if (actualSwiperRef.current) {
          actualSwiperRef.current.destroy(true, true); // Ensure the Swiper instance is properly destroyed
          actualSwiperRef.current = null;
        }
      };
    }
  }, [images, newImages]);

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
      return;
    }

    const blobs = Array.from(files).map((file) => URL.createObjectURL(file));

    setNewImages((prev) => {
      const newBlobs = [...prev, ...blobs];
      return newBlobs;
    });
  };

  const handleSplice = (index, isAlreadyUploaded) => {
    if (isAlreadyUploaded) {
      fileNamesRef.current = fileNamesRef.current.filter((_, i) => i !== index);
      setImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      newFileNamesRef.current = newFileNamesRef.current.filter((_, i) => i !== index);
      setNewImages((prev) => prev.filter((_, i) => i !== index));
    }
  };

  async function handleSave() {
    const files = [
      ...fileNamesRef.current
        .filter((name) => name != null)
        .map((name) => {
          return { fileName: name, isStored: true };
        }),
      ...newFileNamesRef.current
        .filter((name) => name != null)
        .map((name) => {
          return { fileName: name, isStored: false };
        }),
    ];
    await handleRequest(
      new Request('/api/users/MeowMents/update', { method: 'POST', credentials: 'same-origin', body: JSON.stringify({ meowments: files }), headers: { 'Content-Type': 'application/json' } }),
      fetchIntervalRef,
      setIsLoading,
      (data) => {
        setFetchedUserData((prev) => ({ ...prev, meowments: data.meowments }));
        onClose();
      },
      (err) => {}
    );

    console.log(files);
  }

  return (
    <>
      <div ref={swiperContainerRef} className="swiper-container" style={{ width: '100%' }}>
        <div className="swiper-wrapper">
          {images.map((blob, i) => (
            <EditMeowMentImage alreadyUploaded={true} src={blob} key={blob} onSplice={() => handleSplice(i, true)} />
          ))}

          {newImages.map((blob, i) => (
            <EditMeowMentImage
              alreadyUploaded={false}
              src={blob}
              key={blob}
              onSplice={() => handleSplice(i, false)}
              onfinish={(name) => {
                newFileNamesRef.current[i] = name;
              }}
              index={i}
            />
          ))}
          {newImages.filter((blob) => blob !== '/').length + images.length < 5 && (
            <label className="add-meowment-label attached-media-img-container swiper-slide" style={{ width: '100%' }}>
              <input ref={imageInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={previewImage} multiple />
              <div className="add-mewoment-icon-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24">
                  <path d="m11,10h5v1h-5v5h-1v-5h-5v-1h5v-5h1v5Zm13-3.5v17.5H4v-3H0V2.5C0,1.122,1.122,0,2.5,0h16c1.378,0,2.5,1.122,2.5,2.5v1.5h.5c1.378,0,2.5,1.122,2.5,2.5ZM1,20h19V2.5c0-.827-.673-1.5-1.5-1.5H2.5c-.827,0-1.5.673-1.5,1.5v17.5ZM23,6.5c0-.827-.673-1.5-1.5-1.5h-.5v16H5v2h18V6.5Z" />
                </svg>
              </div>
            </label>
          )}
        </div>
        <div ref={swiperNextRef} className="swiper-button-next"></div>
        <div ref={swiperPrevRef} className="swiper-button-prev"></div>
        <div ref={swiperPaginationRef} style={{ width: `${(images.length + newImages.filter((blob) => blob !== '/').length) * 23}px`, display: images.length + newImages.length > 1 ? 'flex' : 'none' }} className="swiper-pagination"></div>
      </div>
      <div className="sure-buttons-container" style={{ marginTop: '1rem', pointerEvents: isLoading ? 'none' : 'all', opacity: isLoading ? '0.4' : '1' }}>
        <button
          style={{ fontSize: '14px' }}
          className="generic-button danger-button"
          onClick={() => {
            onClose();
          }}>
          Cancel
        </button>
        <button style={{ fontSize: '14px' }} className="generic-button" onClick={handleSave}>
          Save
        </button>
      </div>
    </>
  );
};

export default EditMeowMentsSlider;
