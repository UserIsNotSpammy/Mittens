import React, { useEffect, useRef, useState, useContext } from 'react';
import ReactDOM from 'react-dom';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';
import { throwError } from '../../utils/helperFunctions';
import MessageWindow from './MessageWindow';
import { ProfileDataContext } from '../contexts/ProfileDataContext';
const EditPorfilePictureWindow = ({ onClose, previewPfp, previewCover, type }) => {
  const { setCoverPhoto, setProfilePhoto } = useContext(ProfileDataContext);
  const windowRef = useRef(null);
  const imageRef = useRef(null);
  const cropperRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorsWindow, setErrorsWindow] = useState(null);
  useEffect(() => {
    if (imageRef.current) {
      cropperRef.current = new Cropper(imageRef.current, {
        aspectRatio: type === 'profile' ? 1 : 2,
        viewMode: 1,
        autoCropArea: 1,
        zoomable: true,
        responsive: true,
        ready() {
          cropperRef.current.zoomTo(0);
        },
        zoom(event) {
          if (event.detail.ratio === cropperRef.current.options.minZoomRatio) {
            const cropper = cropperRef.current;
            const canvasData = cropper.getCanvasData();
            const containerData = cropper.getContainerData();
            const centerX = containerData.width / 2;
            const centerY = containerData.height / 2;
            cropper.setCanvasData({
              left: centerX - canvasData.width / 2,
              top: centerY - canvasData.height / 2,
            });
          }
        },
      });
    }
    return () => {
      if (cropperRef.current) {
        cropperRef.current.destroy();
      }
    };
  }, [previewCover, previewPfp]);

  async function uploadNewPhoto(file) {
    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    const req = new Request(`/api/users/update${type}Picture`, {
      method: 'post',
      credentials: 'same-origin',
      body: formData,
    });
    try {
      const res = await fetch(req);
      if (!res.ok) {
        const error = await res.text();
        throwError(error, res.status);
      }
      const data = await res.text();
      onClose();
    } catch (err) {
      setErrorsWindow({ status: err.status, message: err.message });
    }

    type === 'profile' ? setProfilePhoto(URL.createObjectURL(file)) : setCoverPhoto(URL.createObjectURL(file));
  }
  const handleSave = () => {
    cropperRef.current.getCroppedCanvas().toBlob(async (blob) => {
      if (blob) {
        const file = new File([blob], `pfp${Math.random() * Date.now()}.jpeg`, { type: 'image/jpeg' });

        await uploadNewPhoto(file);
      }
    }, 'image/jpeg');
  };
  return ReactDOM.createPortal(
    <>
      {errorsWindow && <MessageWindow response={errorsWindow} />}
      <div className="window-outer-container">
        <div className={type === 'profile' ? 'side-block window  edit-pfp-window pfp-preview' : 'side-block window  edit-pfp-window cover-preview'} ref={windowRef} style={{ height: '600px' }}>
          <h2 style={{ fontSize: '17px' }}>Change your {type} picture</h2>

          <div className="hr"></div>
          <div className="pfp-cropper-container" style={isLoading ? { pointerEvents: 'none', opacity: '0.6' } : {}}>
            <img src={type === 'profile' ? previewPfp : previewCover} alt="Preview" ref={imageRef} style={{ maxWidth: '100%' }} />
          </div>
          <div className="hr"></div>
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
        </div>
      </div>
    </>,

    document.body
  );
};
export default EditPorfilePictureWindow;
