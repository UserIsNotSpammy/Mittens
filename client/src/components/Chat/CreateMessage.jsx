import React, { useState, useRef, useEffect, useContext } from 'react';
import { handleRequest } from '../../utils/helperFunctions';
import SendMessageWindow from '../window/SendMessageWindow';
import MessageWindow from '../window/MessageWindow';
import ImagePreview from '../Previews/ImagePreview';
import VideoPreview from '../Previews/VideoPreview';
import TextAreaContainer from './TextAreaContainer.jsx';
import { ActiveChatContext } from '../contexts/ActiveChatContext.jsx';
import useUploadFiles from '../hooks/UseUploadFiles.jsx';

const CreateMessage = ({ chatContainerRef, children }) => {
  const { previewImage, previewVideo, imagePreview, videoPreview, videoInputRef, imageInputRef, videoUploadStroke, imageUploadStroke, attachmentsRef, fileCounter, xhrRef, loadStatus, abortVideo, discardFile, discardVideo, abort, errorsWindow, setImagePreview, setLoadStatus, setVideoPreview } = useUploadFiles('/api/chats/messages/uploadAttachemnts');
  const { activeChat, chatLinks, setChatLinks } = useContext(ActiveChatContext);
  const sendingMessageFetchRef = useRef();
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const inputFieldContainerRef = useRef();
  const [attachmentMenu, setAttachmentMenu] = useState(false);
  const currentChat = useRef(activeChat.userTag);

  useEffect(() => {
    reset();
    currentChat.current = activeChat.userTag;
  }, [activeChat]);

  const reset = (data) => {
    attachmentsRef.current = [];
    xhrRef.current = [];
    fileCounter.current = 0;
    setImagePreview(null);
    setVideoPreview(null);
    setLoadStatus(false);

    setAttachmentMenu(false);

    videoInputRef.current.value = '';
    imageInputRef.current.value = '';
  };

  async function sendMessage(text, resetTextAreaCallback) {
    let body = { text: text, attachments: attachmentsRef.current || [] };
    if (!text.trim() && (!attachmentsRef.current || attachmentsRef.current.length === 0)) return;

    await handleRequest(
      new Request(`/api/chats/messages/${currentChat.current}`, {
        method: 'post',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: body }),
      }),
      sendingMessageFetchRef,
      setIsSendingMessage,
      (data) => {
        reset();
        resetTextAreaCallback();
        setChatLinks((prev) => [prev.find((item) => item.userTag === activeChat.userTag), ...prev.filter((item) => item.userTag !== activeChat.userTag)]);
      },
      null
    );
  }

  return (
    <>
      {errorsWindow && <MessageWindow response={errorsWindow} />}
      {((imagePreview && fileCounter.current) || videoPreview) && (
        <SendMessageWindow closeAndReset={reset}>
          <div className="send-msg-previews-container" style={isSendingMessage ? { pointerEvents: 'none', opacity: '0.7' } : {}}>
            <h1 className="window-header">
              Ready To <span>Pounce</span>?
            </h1>
            {videoPreview && (
              <VideoPreview
                maxHeight={600}
                strokeVal={videoUploadStroke}
                onDiscard={discardVideo}
                src={videoPreview}
                onAbort={() => {
                  abortVideo();
                }}
                loadStatus={loadStatus}
              />
            )}
            {imagePreview && <ImagePreview fileCounter={fileCounter.current} strokeVal={imageUploadStroke} onDiscard={discardFile} onAbort={abort} src={imagePreview} loadStatus={loadStatus} />}
          </div>
          <div className="chat-input-fields" style={isSendingMessage ? { pointerEvents: 'none', opacity: '0.7' } : {}}>
            <TextAreaContainer activeChat={activeChat} chatContainerRef={chatContainerRef} onSend={sendMessage} />
          </div>
        </SendMessageWindow>
      )}
      <div className="chat-input-fields" style={isSendingMessage ? { opacity: '0.7', pointerEvents: 'none' } : {}} ref={inputFieldContainerRef}>
        {children}
        <div className={attachmentMenu ? 'chat-attachments-menu showUp' : 'chat-attachments-menu'}>
          <label className="chat-attachments-menu-label">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path d="M14 9l-2.519 4-2.481-1.96-5 6.96h16l-6-9zm8-5v16h-20v-16h20zm2-2h-24v20h24v-20zm-20 6c0-1.104.896-2 2-2s2 .896 2 2c0 1.105-.896 2-2 2s-2-.895-2-2z" />
            </svg>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                previewImage(e);
              }}
              ref={imageInputRef}
              multiple={true}
              style={{ display: 'none' }}
            />
            <span>Image</span>
          </label>
          <label className="chat-attachments-menu-label">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path d="M4 11c-2.21 0-4-1.791-4-4s1.791-4 4-4 4 1.791 4 4-1.791 4-4 4zm10 2c.702 0 1.373-.127 2-.35v6.35c0 1.104-.896 2-2 2h-10c-1.104 0-2-.896-2-2v-6.35c.627.223 1.298.35 2 .35 2.084 0 3.924-1.068 5-2.687 1.076 1.619 2.916 2.687 5 2.687zm4 1v4l6 3v-10l-6 3zm-4-11c-2.209 0-4 1.791-4 4s1.791 4 4 4 4-1.791 4-4-1.791-4-4-4z" />
            </svg>
            <span>Video</span>
            <input
              onChange={(e) => {
                previewVideo(e);
              }}
              ref={videoInputRef}
              type="file"
              accept="video/*"
              style={{ display: 'none' }}
            />
          </label>
        </div>
        <div
          className="attachments-toggler"
          onClick={() => {
            setAttachmentMenu((prev) => !prev);
          }}>
          <svg clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="m11 11h-7.25c-.414 0-.75.336-.75.75s.336.75.75.75h7.25v7.25c0 .414.336.75.75.75s.75-.336.75-.75v-7.25h7.25c.414 0 .75-.336.75-.75s-.336-.75-.75-.75h-7.25v-7.25c0-.414-.336-.75-.75-.75s-.75.336-.75.75z" fillRule="nonzero" />
          </svg>
        </div>
        <TextAreaContainer key={activeChat.userTag} chatContainerRef={chatContainerRef} onSend={sendMessage} inputFieldContainerRef={inputFieldContainerRef} />
      </div>
    </>
  );
};

export default CreateMessage;
