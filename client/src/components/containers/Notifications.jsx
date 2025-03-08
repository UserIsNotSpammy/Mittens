import React, { useState, useRef, useEffect, useContext } from 'react';
import Notification from './Notification';
import NotificationsSettings from './NotificationsSettings';
import NotificationSkeleton from '../skeletons/NotificationSkeleton';
import { handleRequest } from '../../utils/helperFunctions';
import { LoginContext } from '../contexts/LoginContext';
const Notifications = ({ setunReadNotificationCount, setIsNotificationsMuted, isNotificationsMuted, menuRef }) => {
  const [settingsMenu, setSettingsMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsloading] = useState(false);
  const [noMoreNotifications, setNoMoreNotifications] = useState(false);
  const fetchIntervalRef = useRef();

  const fetchSignlaRef = useRef();
  const skeletonRef = useRef();
  const { socket } = useContext(LoginContext);
  const socketRef = useRef(socket.current);
  const fetchedNotifications = useRef(new Set());

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !isLoading && !fetchIntervalRef.current) {
        fetchNotifications();
      }
    });

    if (skeletonRef.current) {
      observer.observe(skeletonRef.current);
    }

    return () => {
      if (skeletonRef.current) {
        observer.unobserve(skeletonRef.current);
      }
      if (fetchIntervalRef.current) {
        clearInterval(fetchIntervalRef.current);
      }
      if (isLoading) {
        fetchSignlaRef.current?.abort();
      }
    };
  }, []);

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on('notification', (data) => {
        fetchedNotifications.current.add(data._id);
        setNotifications((prev) => [data, ...prev]);
      });
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.off('notification ');
      }
    };
  }, []);

  async function fetchNotifications() {
    fetchSignlaRef.current = new AbortController();
    handleRequest(
      new Request('/api/users/notifications/list', {
        method: 'post',
        credentials: 'same-origin',
        body: JSON.stringify({ loadedNotifications: [...fetchedNotifications.current] }),
        headers: {
          'Content-Type': 'application/json',
        },
        signal: fetchSignlaRef.current.signal,
      }),
      fetchIntervalRef,
      setIsloading,
      (data) => {
        data.forEach((noti) => fetchedNotifications.current.add(noti._id));
        setNotifications((prev) => [...prev, ...data]);
        setunReadNotificationCount(0);
        if (data.length < 10) setNoMoreNotifications(true);
      },
      (err) => {}
    );
  }
  return (
    <div className="side-block notification-menu" ref={menuRef}>
      <NotificationsSettings
        isShown={settingsMenu}
        onClose={() => {
          setSettingsMenu(false);
        }}
      />
      <div className="square-thingie"></div>
      <div className="notifications-header-container">
        {!isNotificationsMuted && (
          <div
            className="notification-icon-wrapper"
            onClick={() => {
              setIsNotificationsMuted(true);
            }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M15 21c0 1.598-1.392 3-2.971 3s-3.029-1.402-3.029-3h6zm.137-17.055c-.644-.374-1.042-1.07-1.041-1.82v-.003c.001-1.172-.938-2.122-2.096-2.122s-2.097.95-2.097 2.122v.003c.001.751-.396 1.446-1.041 1.82-4.668 2.709-1.985 11.715-6.862 13.306v1.749h20v-1.749c-4.877-1.591-2.193-10.598-6.863-13.306zm-3.137-2.945c.552 0 1 .449 1 1 0 .552-.448 1-1 1s-1-.448-1-1c0-.551.448-1 1-1zm-6.451 16c1.189-1.667 1.605-3.891 1.964-5.815.447-2.39.869-4.648 2.354-5.509 1.38-.801 2.956-.76 4.267 0 1.485.861 1.907 3.119 2.354 5.509.359 1.924.775 4.148 1.964 5.815h-12.903z" />
            </svg>
          </div>
        )}

        {isNotificationsMuted && (
          <div
            className="notification-icon-wrapper"
            onClick={() => {
              setIsNotificationsMuted(false);
            }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path d="M22 17.251v1.749h-13.008l2.205-2h7.254c-1.015-1.422-1.465-3.248-1.798-4.949l1.735-1.574c.561 2.98 1.016 5.928 3.612 6.774zm-9.971 6.749c1.578 0 2.971-1.402 2.971-3h-6c0 1.598 1.449 3 3.029 3zm10.971-19.75l-20.654 18.734-1.346-1.479 2.762-2.505h-1.762v-1.749c4.877-1.591 2.194-10.597 6.863-13.306.645-.374 1.041-1.069 1.04-1.82v-.003c0-1.172.939-2.122 2.097-2.122s2.097.95 2.097 2.122v.003c-.001.75.396 1.447 1.04 1.82 1.076.624 1.759 1.585 2.236 2.711l4.285-3.886 1.342 1.48zm-12-2.25c0 .552.448 1 1 1s1-.448 1-1c0-.551-.448-1-1-1s-1 .449-1 1zm-5.032 15l9.812-8.898c-.353-1.083-.842-1.961-1.646-2.427-1.312-.76-2.888-.801-4.267 0-1.485.862-1.907 3.119-2.353 5.51-.36 1.924-.776 4.148-1.965 5.815h.419z" />
            </svg>
          </div>
        )}
        <h1 className="notifications-header">Notifications</h1>
        <div
          className="notification-icon-wrapper settings-icon"
          onClick={() => {
            setSettingsMenu(true);
          }}>
          <svg clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="m11 16.745c0-.414.336-.75.75-.75h9.5c.414 0 .75.336.75.75s-.336.75-.75.75h-9.5c-.414 0-.75-.336-.75-.75zm-9-5c0-.414.336-.75.75-.75h18.5c.414 0 .75.336.75.75s-.336.75-.75.75h-18.5c-.414 0-.75-.336-.75-.75zm4-5c0-.414.336-.75.75-.75h14.5c.414 0 .75.336.75.75s-.336.75-.75.75h-14.5c-.414 0-.75-.336-.75-.75z" fillRule="nonzero" />
          </svg>
        </div>
      </div>

      <div className="notifications-container">
        {notifications.map((noti) => (
          <Notification key={noti._id} {...noti} />
        ))}
        {!noMoreNotifications && (
          <>
            <NotificationSkeleton skeletonRef={skeletonRef} />
            <NotificationSkeleton />
            <NotificationSkeleton />
            <NotificationSkeleton />
          </>
        )}
      </div>
      {/* <h3 className="glowing-link">See More</h3> */}
    </div>
  );
};

export default Notifications;
