import React, { useState, useMemo, useEffect, useContext } from 'react';

import { LoginContext } from '../contexts/LoginContext';
import { formatDate, timeDifference } from '../../utils/helperFunctions';
import { ActiveChatContext } from '../contexts/ActiveChatContext';
const ChatLink = ({ userTag, firstName, lastName, unReadMsg, lastMsg, lastMsgDate, _id }) => {
  const { activeChat, setActiveChat, setChatLinks, setSlideChat, filter } = useContext(ActiveChatContext);
  const { domain, socket } = useContext(LoginContext);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [unReadMessages, setUnReadMessages] = useState(unReadMsg);
  const [lastMessage, setLastMessage] = useState(lastMsg);
  const [lastMessageDate, setLastMessageDate] = useState(lastMsgDate);
  const [isLastMessageRead, setIsLastMessageRead] = useState(true);
  const memoizedChat = useMemo(() => {
    return { userTag: userTag, firstName: firstName, lastName: lastName };
  }, [userTag, firstName, lastName]);

  useEffect(() => {
    if (activeChat?.userTag === userTag) {
      setUnReadMessages(0);
    }

    if (socket.current) {
      socket.current.on('messageNotification', (data) => {
        if (data.sender.userTag === userTag && activeChat?.userTag !== userTag) {
          setUnReadMessages((prev) => prev + 1);
          setLastMessageDate(data.createdAt);
          setIsLastMessageRead(false);

          if (filter != '' || !filter) {
            setChatLinks((prev) => [prev.find((item) => item._id === _id), ...prev.filter((item) => item._id !== _id)]);
          }
          if (data.messageBody?.text) {
            setLastMessage(data.messageBody.text);
          }
        }
      });
    }
    return () => {
      socket.current.off('messageNotification');
    };
  }, [activeChat]);

  function ParseName() {
    const fullName = memoizedChat.firstName + ' ' + memoizedChat.lastName;
    const regex = new RegExp(`(${filter})`, 'gi');

    return (
      <h4>
        {fullName.split(regex).map((part, index) =>
          part.toLowerCase() === filter.toLowerCase() ? (
            <span key={index} style={{ color: 'var(--text-color-glowing)' }}>
              {part}
            </span>
          ) : (
            part
          )
        )}
      </h4>
    );
  }

  return (
    <div
      className="chat-link"
      onClick={() => {
        setSlideChat(true);
        setActiveChat(memoizedChat);
      }}>
      <div className="chats-user-info-container friend-chat" style={userTag === activeChat?.userTag ? { backgroundColor: 'rgba(255, 255, 255, 0.02)' } : {}}>
        <div className="chats-user-info-wrapper">
          <div className="pfp-container">
            <div className="unread-msg-circle">
              <span>{unReadMsg || '0'}</span>
            </div>
            <img
              src={`${domain}/loadImage/pfp/${userTag}`}
              className="pfp"
              alt=""
              style={{ display: isImageLoading ? 'none' : 'block' }}
              onLoad={() => {
                setIsImageLoading(false);
              }}
            />
            {isImageLoading && <div className="skeleton-picture" style={{ width: '100%', height: '100%', borderRadius: '50%' }}></div>}
          </div>
          <div className="name-tag-container">
            {(!filter || filter == '') && (
              <h4>
                {firstName} {lastName}
              </h4>
            )}
            {filter && <ParseName />}
            <h5 style={lastMessage && !isLastMessageRead ? { color: 'var(--text-color-glowing)' } : {}} className="last-msg">
              {lastMessage || "What's the hiss about?"}
            </h5>
          </div>
        </div>
        <div className="time-read">
          <h5> {lastMessageDate && timeDifference(new Date(lastMessageDate)).split('ago')[0]}</h5>
        </div>
        {/* <div className="menu-icon-wrapper">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path d="M6 12c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3zm9 0c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3zm9 0c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3z" />
          </svg>
        </div> */}
        <div className="side-unread-msg-circle" style={{ visibility: unReadMessages === 0 ? 'hidden' : 'visible' }}>
          <span>{unReadMessages}</span>
        </div>
      </div>
    </div>
  );
};

export default ChatLink;
