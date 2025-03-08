import React, { useContext, useEffect, useRef, useState } from 'react';
import EditPorfilePictureWindow from '../window/EditPorfilePictureWindow';
import MessageWindow from '../window/MessageWindow';
import EditProfileWindow from '../window/EditProfileWindow';
import { LoginContext } from '../contexts/LoginContext';
import ProfileHeaderSkeleton from '../skeletons/ProfileHeaderSkeleton';
import { ProfileDataContext } from '../contexts/ProfileDataContext';
import FollowListWindow from '../window/FollowListWindow';
const UserProfileHeader = () => {
  const { fetchedUserData, isFetching, filter, setFilter, coverPhoto, setCoverPhoto, profilePhoto, setProfilePhoto } = useContext(ProfileDataContext);
  const searchedUser = fetchedUserData;
  const { domain, userData } = useContext(LoginContext);

  const [editPfpWindow, setEditPfpWindow] = useState(false);
  const [errorsWindow, setErrorsWindow] = useState(null);
  const [photoBlob, setPhotoBlob] = useState(null);

  const [editProfileWindow, setEditProfileWindow] = useState(false);
  const [isPhotosLoading, setIsPhotosLoading] = useState([true, true]);
  const editCoverPhotoRef = useRef();
  const editProfilePhotoRef = useRef();

  const [isLoading, setIsLoading] = useState(false);
  const [followed, setFollowed] = useState();

  const followInterval = useRef(null);

  const [followListWindow, setFollowListWindow] = useState(null);
  async function handleFollow(shouldFollow) {
    setIsLoading(true);
    const endpoint = shouldFollow ? 'follow' : 'unfollow';
    const req = new Request(`/api/users/${searchedUser.userTag}/${endpoint}`, { method: 'post', credentials: 'same-origin' });
    try {
      let res;
      try {
        res = await fetch(req);
      } catch {
        throwError('internet connection failure', 503);
      }
      if (!res.ok) throwError((await res.text()) || 'Unknown error occurred', res.status || 500);
      setFollowed(shouldFollow);
      setIsLoading(false);
    } catch (err) {
      if (err.status === 503 && err.message === 'internet connection failure') {
        if (!followInterval.current) {
          followInterval.current = setInterval(() => {
            handleFollow(shouldFollow);
          }, 3000);
        }
      } else {
        clearInterval(followInterval.current);
        followInterval.current = null;
        setIsLoading(false);
      }
    }
  }

  useEffect(() => {
    setCoverPhoto(isFetching ? null : `${domain}/loadImage/cover/${searchedUser.userTag}`);
    setProfilePhoto(isFetching ? null : `${domain}/loadImage/pfp/${searchedUser.userTag}`);

    setFollowed(isFetching ? null : fetchedUserData.isFollowed);
  }, [searchedUser, isFetching]);
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

  const handlePhotoLoadingStatus = (index) => {
    setIsPhotosLoading((prev) => {
      const newState = [...prev];
      newState[index] = false;
      return newState;
    });
  };
  function reset() {
    setEditPfpWindow(false);
    setPhotoBlob(null);
    editCoverPhotoRef.current.value = null;
    editProfilePhotoRef.current.value = null;
  }

  return (
    <>
      {editProfileWindow && (
        <EditProfileWindow
          onClose={() => {
            setEditProfileWindow(false);
          }}
        />
      )}

      {followListWindow && (
        <FollowListWindow
          listType={followListWindow}
          onClose={() => {
            setFollowListWindow(null);
          }}
        />
      )}
      {/* {viewPhoto && <PreviewPostImageWindow img />} */}
      {errorsWindow && <MessageWindow response={errorsWindow} />}
      {editPfpWindow && <EditPorfilePictureWindow previewCover={photoBlob} previewPfp={photoBlob} type={editPfpWindow} onClose={reset} />}
      {isFetching && <ProfileHeaderSkeleton />}
      {!isFetching && searchedUser && (
        <div className="side-block profile-overview-container">
          <div className="profile-cover-container">
            {isPhotosLoading[1] && <div className="profile-cover skeleton-picture" style={{ opacity: '1' }}></div>}
            <figure className="profile-cover no-rpt" style={{ backgroundImage: `url(${coverPhoto})`, display: isPhotosLoading[1] ? 'none' : 'block' }}>
              <img
                src={coverPhoto}
                alt=""
                style={{ display: 'none' }}
                onLoad={() => {
                  handlePhotoLoadingStatus(1);
                }}
              />
              {userData.userTag === searchedUser.userTag && (
                <label className="change-pic-icon-container">
                  <div className="camera-icon"></div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      handleImageChange(e, 'cover');
                    }}
                    style={{ display: 'none' }}
                    ref={editCoverPhotoRef}
                  />
                </label>
              )}
            </figure>
            <div className="cover-overlay" style={{ backgroundImage: `url(${coverPhoto})` }}></div>
            <div className="gradient-overlay"></div>
          </div>
          <div className="profile-info-container">
            <div className="profile-pfp-container" style={{ position: 'relative' }}>
              <img
                className="prfile-pfp"
                src={profilePhoto}
                alt=""
                onLoad={() => {
                  handlePhotoLoadingStatus(0);
                }}
                style={{ display: isPhotosLoading[0] ? 'none' : 'block' }}
              />
              {isPhotosLoading[0] && <div className="skeleton-picture" style={{ width: '100%', height: '100%', borderRadius: '50%', opacity: '1', backgroundColor: ' rgb(32 44 53)', animation: 'none' }}></div>}
              {userData.userTag === searchedUser.userTag && (
                <label className="change-pic-icon-container">
                  <div className="camera-icon"></div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      handleImageChange(e, 'profile');
                    }}
                    style={{ display: 'none' }}
                    ref={editProfilePhotoRef}
                  />
                </label>
              )}
            </div>
            <div className="user-tag-container">
              <h1>
                {searchedUser.firstName} {searchedUser.lastName}
              </h1>
              <h4>{searchedUser.userTag}</h4>
              <p>{searchedUser.generalInfo.bio}</p>
            </div>
            {searchedUser.userTag === userData.userTag && (
              <button
                className="generic-button"
                onClick={() => {
                  setEditProfileWindow(true);
                }}>
                Edit Profile
              </button>
            )}
            {searchedUser.userTag != userData.userTag && !followed && (
              <button
                className="generic-button"
                onClick={() => {
                  handleFollow(true);
                }}>
                Follow
              </button>
            )}
            {searchedUser.userTag != userData.userTag && followed && (
              <button
                className="generic-button cancel-btn"
                onClick={() => {
                  handleFollow(false);
                }}>
                Unfollow
              </button>
            )}
          </div>

          <div className="my-stuff-container">
            <div
              // style={filter ? {} : { opacity: 0.65 }}
              className="my-stuff-btn active-btn"
              onClick={() => {
                setFilter(null);
              }}>
              <span>{searchedUser.postsCount}</span>
              <h1>Post{searchedUser.postsCount > 1 || searchedUser.postsCount == 0 ? 's' : ''}</h1>
            </div>
            <div
              className="my-stuff-btn"
              onClick={() => {
                setFollowListWindow('following');
              }}>
              <span>{searchedUser.followingCount}</span>
              <h1>Following</h1>
            </div>
            <div
              className="my-stuff-btn"
              onClick={() => {
                setFollowListWindow('followers');
              }}>
              <span>{searchedUser.followersCount}</span>
              <h1>Follower{searchedUser.followersCount > 1 || searchedUser.followersCount == 0 ? 's' : ''}</h1>
            </div>

            {searchedUser.userTag === userData.userTag && (
              <div
                className="my-stuff-btn"
                // style={filter ? { opacity: 0.65 } : {}}
                onClick={() => {
                  setFilter((prev) => !prev);
                }}>
                <h1>Saves</h1>
                <img src="/images/icons/save.png" alt="" className={filter ? 'save' : ''} style={filter ? { filter: 'invert(56%) sepia(19%) saturate(2243%) hue-rotate(167deg) brightness(86%) contrast(79%)' } : {}} />
              </div>
            )}
          </div>
        </div>
      )}
      <div className="hr" style={{ width: '940px' }}></div>
    </>
  );
};

export default UserProfileHeader;
