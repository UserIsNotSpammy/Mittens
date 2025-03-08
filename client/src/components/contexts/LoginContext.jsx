import React, { createContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { handleRequest } from '../../utils/helperFunctions';
import { useNavigate } from 'react-router-dom';

const LoginContext = createContext();

const LoginContextProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [socketReady, setSocketReady] = useState(false);
  const [unReadNotificationsCount, setUnReadNotificationsCount] = useState(0);
  const [notificationSettings, setNotificationSettings] = useState({});
  const fetchIntervalRef = useRef();
  const socket = useRef();
  const nav = useNavigate();
  const domain = 'http://192.168.1.29:3000';

  const autologin = () => {
    handleRequest(
      new Request('/api/auth/autoLogin', { method: 'post', credentials: 'same-origin' }),
      fetchIntervalRef,
      setIsLoading,
      (data) => {
        setIsLoggedIn(true);
        setUserData(data);
      },
      () => {
        setIsLoggedIn(false);
        setUserData(null);
      }
    );
  };

  useEffect(() => {
    autologin();
  }, []);

  useEffect(() => {
    if (userData && isLoggedIn && !socket.current) {
      socket.current = io('/', {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 2000,
        withCredentials: true,
      });

      socket.current.emit('joinNotificationsRoom', userData.userTag);

      setUnReadNotificationsCount(userData?.unReadNotifications);
      setNotificationSettings(userData.notificationSettings);
      setSocketReady(true);
    }

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [userData, isLoggedIn]);

  return (
    <LoginContext.Provider
      value={{
        isLoggedIn,
        socket,
        userData,
        setUserData,
        domain,
        setUserData,
        setIsLoggedIn,
        isLoading,
        unReadNotificationsCount,
        setUnReadNotificationsCount,
        notificationSettings,
        setNotificationSettings,
        socketReady,
      }}>
      {children}
    </LoginContext.Provider>
  );
};

export { LoginContext, LoginContextProvider };
