import React, { useContext } from 'react';
import NotificationsToggler from './NotificationsToggler';
import { LoginContext } from '../contexts/LoginContext';
const NotificationsSettings = ({ isShown, onClose }) => {
  const { notificationSettings } = useContext(LoginContext);

  return (
    <>
      <div className={isShown ? 'notifications-settings-shady-bg shown' : 'notifications-settings-shady-bg'} style={!isShown ? { transition: '0.5s 0.2s' } : {}}></div>
      <div className={isShown ? 'notification-settings shown' : 'notification-settings'} style={!isShown ? { transition: '0.5s 0s' } : {}}>
        <div className="notifications-settings-header">
          <h4>Notifications Settings</h4>
          <button
            className="close-window-icon"
            onClick={() => {
              onClose();
            }}>
            <svg clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="m14.523 18.787s4.501-4.505 6.255-6.26c.146-.146.219-.338.219-.53s-.073-.383-.219-.53c-1.753-1.754-6.255-6.258-6.255-6.258-.144-.145-.334-.217-.524-.217-.193 0-.385.074-.532.221-.293.292-.295.766-.004 1.056l4.978 4.978h-14.692c-.414 0-.75.336-.75.75s.336.75.75.75h14.692l-4.979 4.979c-.289.289-.286.762.006 1.054.148.148.341.222.533.222.19 0 .378-.072.522-.215z" fillRule="nonzero" />
            </svg>
          </button>
        </div>

        <div className="notifications-settings-container">
          <NotificationsToggler description="Purrs On Your Posts" isToggled={notificationSettings?.purrsOnPosts} type="purrsOnPosts" />
          <NotificationsToggler description="Saves On Your Posts" isToggled={notificationSettings?.savesOnPosts} type="savesOnPosts" />
          <NotificationsToggler description="Scratches On Your Posts" isToggled={notificationSettings?.scratchesOnPosts} type="scratchesOnPosts" />
          <NotificationsToggler description="Remeows On Your Posts" isToggled={notificationSettings?.remeowsOnPosts} type="remeowsOnPosts" />
          <NotificationsToggler description="Purrs On Your Comments" isToggled={notificationSettings?.purrsOnComments} type="purrsOnComments" />
          <NotificationsToggler description="Replies On Your Comments" isToggled={notificationSettings?.repliesOnComments} type="repliesOnComments" />
          <NotificationsToggler description="Someone Follows You" isToggled={notificationSettings?.followsYou} type="followsYou" />
        </div>
      </div>
    </>
  );
};

export default NotificationsSettings;
