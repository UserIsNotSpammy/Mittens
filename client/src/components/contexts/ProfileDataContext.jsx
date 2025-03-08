import React, { createContext, useState, useEffect, useRef, useContext } from 'react';
import { handleRequest } from '../../utils/helperFunctions';
import { useParams } from 'react-router-dom';
import { LoginContext } from './LoginContext';
const ProfileDataContext = createContext();

const ProfileDataContextProvider = ({ children }) => {
  const { domain } = useContext(LoginContext);
  const [fetchedUserData, setFetchedUserData] = useState();
  const [isFetching, setIsFetching] = useState(true);
  const [filter, setFilter] = useState(JSON.parse(localStorage.getItem('profile'))?.filter || null);
  const fetchingControllerRef = useRef(new AbortController());
  const fetchingIntervalRef = useRef(null);
  const [errorsWindow, setErrorsWindow] = useState(null);
  const [coverPhoto, setCoverPhoto] = useState(isFetching ? null : `${domain}/loadImage/cover/${fetchedUserData.userTag}`);
  const [profilePhoto, setProfilePhoto] = useState(isFetching ? null : `${domain}/loadImage/pfp/${fetchedUserData.userTag}`);
  useEffect(() => {
    const profile = JSON.parse(localStorage.getItem('profile')) || {};
    profile.filter = filter;
    localStorage.setItem('profile', JSON.stringify(profile));
  }, [filter]);

  //   const { userData } = useContext(LoginContext);
  const { tag } = useParams();

  useEffect(() => {
    GetUser();
    setFilter(null);
    return () => {
      // cleanup
      if (fetchingControllerRef.current) {
        fetchingControllerRef.current.abort();
      }
      if (fetchingIntervalRef.current) {
        clearInterval(fetchingIntervalRef.current);
      }
    };
  }, [tag]);

  async function GetUser() {
    if (fetchingControllerRef.current) {
      fetchingControllerRef.current.abort();
    }

    fetchingControllerRef.current = new AbortController();
    await handleRequest(
      new Request(`/api/users/${tag}`, {
        method: 'POST',
        credentials: 'same-origin',
        signal: fetchingControllerRef.current.signal,
      }),
      fetchingIntervalRef,
      setIsFetching,
      (data) => {
        setFetchedUserData(data);
      },
      setErrorsWindow
    );
  }
  return <ProfileDataContext.Provider value={{ fetchedUserData, isFetching, filter, setFilter, errorsWindow, tag, coverPhoto, profilePhoto, setCoverPhoto, setProfilePhoto, setFetchedUserData }}>{children}</ProfileDataContext.Provider>;
};

export { ProfileDataContext, ProfileDataContextProvider };
