import React, { useEffect, useContext, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { handleRequest } from '../../utils/helperFunctions';
import { ProfileDataContext } from '../contexts/ProfileDataContext.jsx';
import UserSkeleton from '../skeletons/UserSkeleton.jsx';
import User from '../User.jsx';
const FollowListWindow = ({ onClose, listType }) => {
  const [isLoading, setIsloading] = useState(false);
  const [searchedUsers, setSearcheddUsers] = useState([]);
  const fetchingIntervalRef = useRef();
  const { fetchedUserData } = useContext(ProfileDataContext);
  const loadedUsers = useRef(new Set());
  const [noMore, setNoMore] = useState(false);

  const skeleCounter = Array(4).fill(0);
  useEffect(() => {
    fetchUsers();
  }, [listType]);

  function renderHeader() {
    if (listType == 'following')
      return (
        <h1 className="window-header" style={{ margin: '0px' }}>
          Who's {fetchedUserData.firstName} <span>Following</span>
        </h1>
      );

    return (
      <h1 className="window-header">
        Who's <span>Following</span> {fetchedUserData.firstName}
      </h1>
    );
  }
  async function fetchUsers() {
    await handleRequest(
      new Request(`/api/users/${fetchedUserData.userTag}/${listType}`, { method: 'post', credentials: 'same-origin', body: JSON.stringify({ loadedUsers: [...loadedUsers.current] }), headers: { 'Content-Type': 'application/json' } }),
      fetchingIntervalRef,
      setIsloading,
      (data) => {
        if (data.length < 5) setNoMore(true);
        data.forEach((element) => loadedUsers.current.add(element.userTag));

        setSearcheddUsers((prev) => [...prev, ...data]);
      },
      null
    );
  }
  return createPortal(
    <div className="window-outer-container follow-list-window">
      <div className="side-block window " style={{ height: '620px' }}>
        <button
          className="close-window-icon"
          onClick={() => {
            onClose();
          }}>
          <svg clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="m12 10.93 5.719-5.72c.146-.146.339-.219.531-.219.404 0 .75.324.75.749 0 .193-.073.385-.219.532l-5.72 5.719 5.719 5.719c.147.147.22.339.22.531 0 .427-.349.75-.75.75-.192 0-.385-.073-.531-.219l-5.719-5.719-5.719 5.719c-.146.146-.339.219-.531.219-.401 0-.75-.323-.75-.75 0-.192.073-.384.22-.531l5.719-5.719-5.72-5.719c-.146-.147-.219-.339-.219-.532 0-.425.346-.749.75-.749.192 0 .385.073.531.219z" />
          </svg>
        </button>

        {renderHeader()}
        <div className="follow-list-container">
          {searchedUsers.map((user, i) => (
            <User {...user} key={user.userTag + i} />
          ))}
          {isLoading === true && skeleCounter.map((v, index) => <UserSkeleton key={index} />)}

          {!noMore && (
            <span
              style={isLoading ? { pointerEvents: 'none', opacity: '0.65' } : {}}
              className="glowing-link"
              onClick={() => {
                fetchUsers();
              }}>
              Show More
            </span>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default FollowListWindow;
