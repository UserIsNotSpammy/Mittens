import React, { useEffect, useState, useRef, useContext } from 'react';
import { LoginContext } from '../contexts/LoginContext';
import Message from './Message';
import { handleRequest, stopRefetching } from '../../utils/helperFunctions';
import MessageSkeleton from '../skeletons/MessageSkeleton.jsx';
import { ActiveChatContext } from '../contexts/ActiveChatContext.jsx';
import CreateMessage from './CreateMessage.jsx';
import { Link } from 'react-router-dom';
const Chat = () => {
  const { domain, userData, socket } = useContext(LoginContext);
  const [messages, setMessages] = useState([]);

  const [isLoading, setIsloading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [noMore, setNoMore] = useState(false);
  const fetchingIntervalRef = useRef();
  const chatContainerRef = useRef();
  const fetchSignal = useRef(null);
  const { activeChat, setActiveChat, slideChat, setSlideChat } = useContext(ActiveChatContext);
  const skeletonRef = useRef();
  const chatWrapperRef = useRef();
  const [scrollBackIcon, setScrollBackIcon] = useState(false);
  const fetchedMessagesRef = useRef(new Set());
  const oldScrollHeight = useRef(0);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !isLoading && !fetchingIntervalRef.current) {
        fetchChat();
      }
    });

    if (skeletonRef.current) {
      observer.observe(skeletonRef.current);
    }

    return () => {
      if (skeletonRef.current) {
        observer.unobserve(skeletonRef.current);
      }
      if (fetchingIntervalRef.current) {
        clearInterval(fetchingIntervalRef.current);
      }
      if (isLoading) {
        fetchSignal.current?.abort();
      }
      if (fetchSignal.current) {
        fetchSignal.current.abort();
      }
    };
  }, [activeChat]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.style.opacity = '0';
      setTimeout(() => {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight - oldScrollHeight.current;
        oldScrollHeight.current = chatContainerRef.current.scrollHeight;
        chatContainerRef.current.style.opacity = '1';
      }, 10);
    }
  }, [activeChat, messages]);

  useEffect(() => {
    if (activeChat && socket.current) {
      const chatRoomId = [activeChat.userTag, userData.userTag].sort().join('');

      if (socket.current.connected) {
        console.log('connected to romo');
        socket.current.emit('joinChatRoom', chatRoomId);
      } else {
        console.log('connected to romo2');
        socket.current.on('connect', () => {
          socket.current.emit('joinChatRoom', chatRoomId);
        });
      }

      function handleNewMessage(message) {
        if ((message.recipient.userTag === activeChat?.userTag && message.sender.userTag === userData.userTag) || (message.sender.userTag === activeChat?.userTag && message.recipient.userTag === userData.userTag)) {
          fetchedMessagesRef.current.add(message._id);
          oldScrollHeight.current = 0;
          setMessages((prev) => [...prev, message]);
        }
      }

      socket.current?.on('message', handleNewMessage);

      return () => {
        socket.current?.off('message', handleNewMessage);
        socket.current?.emit('leaveChatRoom', chatRoomId);
      };
    }
  }, [socket, activeChat, userData]);

  function fetchChat() {
    if (fetchSignal.current) {
      fetchSignal.current.abort();
    }
    const controller = new AbortController();
    fetchSignal.current = controller;

    handleRequest(
      new Request(`/api/chats/messages/LoadMessages/${activeChat.userTag}`, {
        method: 'POST',
        credentials: 'same-origin',
        body: JSON.stringify({ fetchedMessages: [...fetchedMessagesRef.current] }),
        signal: fetchSignal.current.signal,
        headers: { 'Content-Type': 'application/json' },
      }),
      fetchingIntervalRef,
      setIsloading,
      (data) => {
        if (!data.length) setNoMore(true);
        data.forEach((message) => {
          fetchedMessagesRef.current.add(message._id);
        });
        setMessages((prev) => [...data, ...prev]);
      },
      null
    );
  }

  function scrollBack() {
    chatContainerRef.current.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: 'smooth' });
  }

  return (
    <>
      <div className={slideChat ? 'chat-container slide-chat' : 'chat-container'}>
        {activeChat && (
          <>
            <header className="chat-header">
              <div className="pfp-container">
                <img
                  src={`${domain}/loadImage/pfp/${activeChat.userTag}`}
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
                <h4>
                  <Link to={`/Mewtopia/${activeChat.userTag}`} style={{ color: 'var(--text-color)' }}>
                    {activeChat.firstName} {activeChat.lastName}
                  </Link>
                </h4>
                <h5> {activeChat.userTag} </h5>
              </div>

              <div className="chat-header-icon-container">
                {/* <div className="chat-icon-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" dataName="Layer 1" viewBox="0 0 24 24">
              <path d="M24,6.24c0,7.64-10.13,17.76-17.76,17.76-1.67,0-3.23-.63-4.38-1.78l-1-1.15c-1.16-1.16-1.16-3.12,.05-4.33,.03-.03,2.44-1.88,2.44-1.88,1.2-1.14,3.09-1.14,4.28,0l1.46,1.17c3.2-1.36,5.47-3.64,6.93-6.95l-1.16-1.46c-1.15-1.19-1.15-3.09,0-4.28,0,0,1.85-2.41,1.88-2.44,1.21-1.21,3.17-1.21,4.38,0l1.05,.91c1.2,1.19,1.83,2.75,1.83,4.42Z" />
            </svg>
          </div> */}
                <div className="chat-icon-wrapper">
                  <svg clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="m11 16.745c0-.414.336-.75.75-.75h9.5c.414 0 .75.336.75.75s-.336.75-.75.75h-9.5c-.414 0-.75-.336-.75-.75zm-9-5c0-.414.336-.75.75-.75h18.5c.414 0 .75.336.75.75s-.336.75-.75.75h-18.5c-.414 0-.75-.336-.75-.75zm4-5c0-.414.336-.75.75-.75h14.5c.414 0 .75.336.75.75s-.336.75-.75.75h-14.5c-.414 0-.75-.336-.75-.75z" fillRule="nonzero" />
                  </svg>
                </div>

                <div
                  className="chat-icon-wrapper change-chat-btn"
                  onClick={() => {
                    setSlideChat(false);
                    setActiveChat(null);
                  }}>
                  <svg clip-rule="evenodd" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="m14.523 18.787s4.501-4.505 6.255-6.26c.146-.146.219-.338.219-.53s-.073-.383-.219-.53c-1.753-1.754-6.255-6.258-6.255-6.258-.144-.145-.334-.217-.524-.217-.193 0-.385.074-.532.221-.293.292-.295.766-.004 1.056l4.978 4.978h-14.692c-.414 0-.75.336-.75.75s.336.75.75.75h14.692l-4.979 4.979c-.289.289-.286.762.006 1.054.148.148.341.222.533.222.19 0 .378-.072.522-.215z" fill-rule="nonzero" />
                  </svg>
                </div>
              </div>
            </header>

            <div className="chat-messages-wrapper" ref={chatWrapperRef}>
              <div className="ultimate-bg2"></div>
              <div
                ref={chatContainerRef}
                className="chat-messages-container"
                onScroll={() => {
                  if (chatContainerRef.current) {
                    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
                    oldScrollHeight.current == scrollTop;
                    setScrollBackIcon(scrollTop < scrollHeight - clientHeight);
                  }
                }}>
                {/* {!noMore && (
                  <>
                    <MessageSkeleton flag={true} skeletonRef={skeletonRef} />
                  </>
                )} */}
                {/* <div className="loader-container" style={isLoading == true ? { visibility: 'visible' } : {}}>
                  <div className="spinner"></div>
                </div> */}
                {!noMore && <div ref={skeletonRef}> </div>}
                {activeChat && messages.map((data, i) => <Message key={data._id} {...data} chatContainerRef={chatContainerRef} />)}
              </div>
            </div>
            <CreateMessage chatContainerRef={chatWrapperRef}>
              <div className={scrollBackIcon ? 'scroll-back-icon visible-icon' : 'scroll-back-icon'}>
                <div
                  className="icon-wrapper"
                  onClick={() => {
                    scrollBack();
                  }}>
                  <svg clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="m5.214 14.522s4.505 4.502 6.259 6.255c.146.147.338.22.53.22s.384-.073.53-.22c1.754-1.752 6.249-6.244 6.249-6.244.144-.144.216-.334.217-.523 0-.193-.074-.386-.221-.534-.293-.293-.766-.294-1.057-.004l-4.968 4.968v-14.692c0-.414-.336-.75-.75-.75s-.75.336-.75.75v14.692l-4.979-4.978c-.289-.289-.761-.287-1.054.006-.148.148-.222.341-.221.534 0 .189.071.377.215.52z" fillRule="nonzero" />
                  </svg>
                </div>
              </div>
            </CreateMessage>
          </>
        )}

        {!activeChat && (
          <div className="chat-wlcm-msg">
            <div className="ultimate-bg2"></div>
            <img src="/images/icons/zzz.png" alt="" />
            <h1>
              <span>Paw</span>sitive Vibes
            </h1>
          </div>
        )}
      </div>
    </>
  );
};

export default Chat;
