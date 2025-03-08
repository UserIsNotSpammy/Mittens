import React, { useContext, useEffect, useRef, useState } from 'react';
import ShowMoreText from '../MediaPlayers/ShowMoreText';
import { handleRequest, timeDifference } from '../../utils/helperFunctions';
import { LoginContext } from '../contexts/LoginContext';
import { Link } from 'react-router-dom';
import Image from '../MediaPlayers/Image';
import VideoPlayer from '../MediaPlayers/VideoPlayer';
import Slider from '../MediaPlayers/Slider';
import AreYouSureWindow from '../window/AreYouSureWindow';
import SmallMenu from './SmallMenu';
import { formatDate } from '../../utils/helperFunctions';
const Comment = ({ comment_id, interactions, createdAt, commentedBy, post_id, commentBody, comments, setComments }) => {
  const { domain, userData, socket } = useContext(LoginContext);
  const [InteractionsCount, setPostInteractionsCount] = useState(interactions.likes.count);
  const [LikesCount, setLikesCount] = useState(interactions.likes.count);
  const [likeStaus, setLikeStatus] = useState(interactions.likes.isInteracted);

  const [errorsWindow, setErrorsWindow] = useState(null);
  const [isLiking, setIsLiking] = useState(false);
  const likeIntervalRef = useRef();

  const [smallMenu, setSmallMenu] = useState();

  // const deletingIntervalRef = useRef();

  // const [isDeleting, setIsdeleting] = useState(false);

  useEffect(() => {
    if (!socket.current) {
      console.error('Socket is not initialized');
      return; // Exit if the socket isn't ready
    }

    const joinRoomIfNotConnected = () => {
      if (socket.current.connected) {
        socket.current.emit('joinCommentRoom', comment_id);
      }
    };

    socket.current.emit('joinCommentRoom', comment_id);

    const handleLikeSaveUpdate = (data) => {
      console.log(data);
      if (data.comment_id === comment_id) {
        setLikesCount(data.likesCount);
        setPostInteractionsCount(data.totalInteractions);
      }
    };

    socket.current.on('like-comment', handleLikeSaveUpdate);
    socket.current.on('connect', joinRoomIfNotConnected);

    return () => {
      socket.current.emit('leaveCommentRoom', comment_id);
      socket.current.off('like-comment', handleLikeSaveUpdate);
      socket.current.off('connect', joinRoomIfNotConnected);
    };
  }, [comment_id, socket]);

  async function likeCommnet(e) {
    await handleRequest(
      new Request(`/api/posts/${post_id}/comments/${comment_id}/like`, {
        method: 'post',
        credentials: 'same-origin',
        body: JSON.stringify({ isInteracted: e.target.checked }),
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      likeIntervalRef,
      setIsLiking,
      (data) => {
        setLikeStatus(e.target.checked);
      },
      setErrorsWindow
    );
  }

  async function deleteComment(setIsLoading, ref, onError) {
    await handleRequest(
      new Request(`/api/posts/${post_id}/comments/${comment_id}/delete`, {
        method: 'delete',
        credentials: 'same-origin',
      }),
      ref,
      setIsLoading,
      (data) => {
        const filteredComments = comments.filter((comment) => {
          return comment.comment_id != comment_id;
        });
        setComments(filteredComments);
        // setDeletePostMenu(false);
      },
      onError
    );
  }
  return (
    <>
      <div className="comment-container">
        <header className="avatar">
          <img src={`${domain}/loadImage/pfp/${commentedBy.userTag}`} alt="" className="pfp" />
          <div className="user-info">
            <Link to={`/Mewtopia/${commentedBy.userTag}`}>
              {commentedBy.firstName} {commentedBy.lastName}
            </Link>
            <span>{timeDifference(createdAt)}</span>
          </div>
          <div
            className="dots"
            style={{ minHeight: '20px', minWidth: '20px', width: '22px', height: '22px' }}
            onClick={() => {
              setSmallMenu((prev) => !prev);
            }}>
            <svg style={{ minHeight: '12px', minWidth: '12px', width: '19px', height: '19px' }} clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.5 11.995c0-1.242 1.008-2.25 2.25-2.25s2.25 1.008 2.25 2.25-1.008 2.25-2.25 2.25-2.25-1.008-2.25-2.25zm-6.75 0c0-1.242 1.008-2.25 2.25-2.25s2.25 1.008 2.25 2.25-1.008 2.25-2.25 2.25-2.25-1.008-2.25-2.25zm-6.75 0c0-1.242 1.008-2.25 2.25-2.25s2.25 1.008 2.25 2.25-1.008 2.25-2.25 2.25-2.25-1.008-2.25-2.25z" />
            </svg>
          </div>

          {smallMenu && (
            <SmallMenu
              dataToDisplay={[
                { header: 'Commented By', value: `${commentedBy.firstName} ${commentedBy.lastName}` },
                { header: 'User Tag', value: `${commentedBy.userTag}` },
                { header: 'Commented In', value: formatDate(createdAt) },

                { header: 'Comment Id', value: comment_id },
              ]}
              onClose={() => {
                setSmallMenu(false);
              }}
              shareUrl={null}
              menuBtnRef={null}
              deleteTarget={deleteComment}
              targetOwned={commentedBy.userTag === userData.userTag}
              warningMessage={{ title: 'Delete Comment', message: 'Are you sure you want to delete this comment' }}
            />
          )}
        </header>
        <div className="comment-content">
          {commentBody.text && <ShowMoreText text={commentBody.text} />}
          {commentBody.image && commentBody.image.length === 1 && <Image src={`/loadImage/comment/${commentBody.image[0]?.fileName}`} img={commentBody.image[0]} />}
          {commentBody.image && commentBody.image.length > 1 && <Slider blobs={commentBody.image} endPoint={`loadImage/comment`} />}
          {commentBody.video && <VideoPlayer src={`${domain}/loadVideo/comment/${commentBody.video?.fileName}`} />}
        </div>

        <div className="reactions-container">
          <div className="icons-container" style={!InteractionsCount ? { visibility: 'hidden' } : {}}>
            <div className="icon-wrapper" style={{ backgroundColor: 'var(--red)' }}>
              <img src="/images/icons/paw.png" alt="" className="reaction-icon" />
            </div>

            {InteractionsCount && <span>{InteractionsCount}</span>}
          </div>

          <div className="reaction-buttons-container">
            <label className="reaction-btn">
              <img className={likeStaus ? 'paw' : ''} src="/images/icons/paw.png" alt="" />
              <input type="checkbox" style={{ display: 'none' }} defaultChecked={likeStaus} onChange={likeCommnet} />
            </label>
          </div>
        </div>
      </div>
    </>
  );
};

export default Comment;
