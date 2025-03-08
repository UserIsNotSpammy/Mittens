import React, { useRef, useContext, useState } from 'react';
import { createPortal } from 'react-dom';
import Slider from '../MediaPlayers/Slider';
import Image from '../MediaPlayers/Image';
import { ProfileDataContext } from '../contexts/ProfileDataContext';
import { formatDate } from '../../utils/helperFunctions';
import EditPorfilePictureWindow from './EditPorfilePictureWindow';
import EditMeowMentsWindow from './EditMeowMentsWindow';
import EditGeneralInfoWindow from './EditGeneralInfoWindow';
import EditPassowrdWindow from './EditPassowrdWindow';
import EditCatScentWindow from './EditCatScentWindow';
const EditProfileWindow = ({ onClose }) => {
  const { coverPhoto, profilePhoto, fetchedUserData } = useContext(ProfileDataContext);
  const [photoBlob, setPhotoBlob] = useState(null);
  const [editPfpWindow, setEditPfpWindow] = useState(false);
  const [editMeowMentsWindow, setEditMeowMentsWindow] = useState();
  const [editGeneralInfoWindow, setEditGeneralInfoWindow] = useState(false);
  const [editPasswordWindow, setEditPasswordWindow] = useState(false);
  const [editCatscentWindow, setEditCatscentWindow] = useState(false);
  const editCoverPhotoRef = useRef();
  const editProfilePhotoRef = useRef();
  const windowRef = useRef();
  function reset() {
    setEditPfpWindow(false);
    setPhotoBlob(null);
    editCoverPhotoRef.current.value = null;
    editProfilePhotoRef.current.value = null;
  }
  function RenderSettings({ label, currentData, onClick, disabled }) {
    return (
      <div className={disabled ? 'settings-label-block disabled-settings' : 'settings-label-block'} onClick={onClick}>
        <div className="settings-label">
          <h3>{label}</h3>
          <div className="settings-svg-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24">
              <path d="m10.5,19c-.123,0-.245-.045-.341-.135-.202-.188-.212-.505-.024-.707l4.142-4.43c.471-.471.723-1.08.723-1.729s-.252-1.258-.711-1.717l-4.154-4.441c-.188-.202-.178-.519.024-.707.201-.187.518-.179.707.023l4.142,4.43c.636.636.993,1.496.993,2.412s-.357,1.776-1.004,2.424l-4.13,4.418c-.099.105-.232.158-.365.158Z" />
            </svg>
          </div>
        </div>
        <h4 className="settings-original-info">{currentData}</h4>
      </div>
    );
  }
  const handleImageChange = (event, type) => {
    const file = event.target.files[0];
    if (file.size > 25 * 1024 * 1024) {
      setErrorsWindow({ message: 'File is too large', status: 413 });
      return;
    }
    if (!file.type.startsWith('image/')) {
      setErrorsWindow({ message: 'Invalid file type', status: 400 });
      return;
    }

    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setEditPfpWindow(type);
      setPhotoBlob(objectUrl);
    }
  };
  return createPortal(
    <>
      {editMeowMentsWindow && (
        <EditMeowMentsWindow
          onClose={() => {
            setEditMeowMentsWindow(false);
          }}
        />
      )}
      {editPasswordWindow && <EditPassowrdWindow onClose={() => setEditPasswordWindow(false)} />}
      {editGeneralInfoWindow && <EditGeneralInfoWindow onClose={() => setEditGeneralInfoWindow(false)} />}
      {editPfpWindow && <EditPorfilePictureWindow previewCover={photoBlob} previewPfp={photoBlob} type={editPfpWindow} onClose={reset} />}
      {editCatscentWindow && (
        <EditCatScentWindow
          onClose={() => {
            setEditCatscentWindow(null);
          }}
        />
      )}
      <div ref={windowRef} className="window-outer-container">
        <div className="side-block window edit-profile-window">
          <div className="window-settings-header" style={{ marginBottom: '1rem' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path d="M24 14.187v-4.374c-2.148-.766-2.726-.802-3.027-1.529-.303-.729.083-1.169 1.059-3.223l-3.093-3.093c-2.026.963-2.488 1.364-3.224 1.059-.727-.302-.768-.889-1.527-3.027h-4.375c-.764 2.144-.8 2.725-1.529 3.027-.752.313-1.203-.1-3.223-1.059l-3.093 3.093c.977 2.055 1.362 2.493 1.059 3.224-.302.727-.881.764-3.027 1.528v4.375c2.139.76 2.725.8 3.027 1.528.304.734-.081 1.167-1.059 3.223l3.093 3.093c1.999-.95 2.47-1.373 3.223-1.059.728.302.764.88 1.529 3.027h4.374c.758-2.131.799-2.723 1.537-3.031.745-.308 1.186.099 3.215 1.062l3.093-3.093c-.975-2.05-1.362-2.492-1.059-3.223.3-.726.88-.763 3.027-1.528zm-4.875.764c-.577 1.394-.068 2.458.488 3.578l-1.084 1.084c-1.093-.543-2.161-1.076-3.573-.49-1.396.581-1.79 1.693-2.188 2.877h-1.534c-.398-1.185-.791-2.297-2.183-2.875-1.419-.588-2.507-.045-3.579.488l-1.083-1.084c.557-1.118 1.066-2.18.487-3.58-.579-1.391-1.691-1.784-2.876-2.182v-1.533c1.185-.398 2.297-.791 2.875-2.184.578-1.394.068-2.459-.488-3.579l1.084-1.084c1.082.538 2.162 1.077 3.58.488 1.392-.577 1.785-1.69 2.183-2.875h1.534c.398 1.185.792 2.297 2.184 2.875 1.419.588 2.506.045 3.579-.488l1.084 1.084c-.556 1.121-1.065 2.187-.488 3.58.577 1.391 1.689 1.784 2.875 2.183v1.534c-1.188.398-2.302.791-2.877 2.183zm-7.125-5.951c1.654 0 3 1.346 3 3s-1.346 3-3 3-3-1.346-3-3 1.346-3 3-3zm0-2c-2.762 0-5 2.238-5 5s2.238 5 5 5 5-2.238 5-5-2.238-5-5-5z" />
            </svg>
            <h1>
              <span>Manage</span> Account
            </h1>
          </div>

          <button
            className="close-window-icon"
            onClick={() => {
              onClose();
            }}>
            <svg clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="m12 10.93 5.719-5.72c.146-.146.339-.219.531-.219.404 0 .75.324.75.749 0 .193-.073.385-.219.532l-5.72 5.719 5.719 5.719c.147.147.22.339.22.531 0 .427-.349.75-.75.75-.192 0-.385-.073-.531-.219l-5.719-5.719-5.719 5.719c-.146.146-.339.219-.531.219-.401 0-.75-.323-.75-.75 0-.192.073-.384.22-.531l5.719-5.719-5.72-5.719c-.146-.147-.219-.339-.219-.532 0-.425.346-.749.75-.749.192 0 .385.073.531.219z" />
            </svg>
          </button>
          <div className="settings-block">
            <div className="settings-blocl-header-container">
              <h1 className="settings-block-header">
                <span>Cover</span> Photo
              </h1>

              <label className="edit-profile-btn">
                Edit
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    handleImageChange(e, 'cover');
                  }}
                  style={{ display: 'none' }}
                  ref={editProfilePhotoRef}
                />
              </label>
            </div>
            <figure className="edit-profile-window-cover-photo" style={{ backgroundImage: `url(${coverPhoto})` }}></figure>
            <div className="hr" style={{ width: '70%' }}></div>
          </div>

          <div className="settings-block">
            <div className="settings-blocl-header-container">
              <h1 className="settings-block-header">
                <span>Profile</span> Picture
              </h1>
              <label className="edit-profile-btn">
                Edit
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    handleImageChange(e, 'profile');
                  }}
                  style={{ display: 'none' }}
                  ref={editCoverPhotoRef}
                />
              </label>
            </div>
            <div className="pfp-container">
              <img src={profilePhoto} className="pfp" alt="" />
            </div>
            <div className="hr" style={{ width: '70%' }}></div>
          </div>

          <div className="settings-block">
            <div className="settings-blocl-header-container">
              <h1 className="settings-block-header">
                <span>Cat</span>Scent
              </h1>
              <button
                onClick={() => {
                  setEditCatscentWindow(true);
                }}>
                Edit
              </button>
            </div>
            <h1>{fetchedUserData.generalInfo.bio}</h1>
            <div className="hr" style={{ width: '70%' }}></div>
          </div>

          <div className="settings-block">
            <div className="settings-blocl-header-container">
              <h1 className="settings-block-header">
                <span>Meow</span>Ment
              </h1>
              <button
                onClick={() => {
                  setEditMeowMentsWindow(true);
                }}>
                Edit
              </button>
            </div>
            {fetchedUserData.meowments?.length === 1 && <Image src={`/LoadMeowment/${fetchedUserData.userTag}/${fetchedUserData.meowments[0].fileName}`} img={fetchedUserData.meowments[0]} />}
            {fetchedUserData.meowments?.length === 0 && <Image src={`/LoadMeowment/${fetchedUserData.userTag}/default`} img={fetchedUserData.meowments[0]} />}
            {fetchedUserData.meowments?.length > 1 && <Slider blobs={fetchedUserData.meowments} endPoint={`LoadMeowment/${fetchedUserData.userTag}`} loop={true} />}
            <div className="hr" style={{ width: '70%' }}></div>
          </div>
          <div className="settings-block">
            <div className="settings-blocl-header-container">
              <h1 className="settings-block-header">
                <span>General</span> Info
              </h1>
              <button
                onClick={() => {
                  setEditGeneralInfoWindow(true);
                }}>
                Edit
              </button>
            </div>

            <div className="settings-labels-container">
              <RenderSettings label={'First Name'} currentData={fetchedUserData.firstName} />
              <RenderSettings label={'Last Name'} currentData={fetchedUserData.lastName} />
              <RenderSettings label={'Birth Date'} currentData={formatDate(fetchedUserData.generalInfo.dateOfBirth)} />
              <RenderSettings label={'Gender'} currentData={fetchedUserData.generalInfo.gender} />
              <RenderSettings label={'Country'} currentData={fetchedUserData.generalInfo.livesIn} />
            </div>
            <div className="hr" style={{ width: '70%' }}></div>
          </div>

          <div className="settings-block">
            <div className="settings-blocl-header-container">
              <h1 className="settings-block-header">
                <span>Credentials & </span> Privacy
              </h1>
              {/* <button>Edit</button> */}
            </div>
            <div className="settings-labels-container">
              <RenderSettings label={'Email Address'} currentData={fetchedUserData.generalInfo.email} disabled={true} />
              <RenderSettings label={'Phone Number'} currentData={fetchedUserData.generalInfo.phoneNumber} disabled={true} />
              <RenderSettings label={'User Tag'} currentData={fetchedUserData.userTag} disabled={true} />
              <RenderSettings label={'Password'} currentData={'********'} onClick={() => setEditPasswordWindow(true)} />
            </div>
            {/* <div className="hr" style={{ width: '70%' }}></div> */}
          </div>
        </div>
      </div>
    </>,

    document.body
  );
};

export default EditProfileWindow;
