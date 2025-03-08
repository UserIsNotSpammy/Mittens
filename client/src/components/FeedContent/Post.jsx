import React, { useRef, useState, useEffect, useContext } from 'react';
import Comment from './Comment';
import Skeleton from '../skeletons/Skeleton';
import PostContent from './PostContent';
import RemeowWindow from '../window/RemeowWindow';
import ShowMoreText from '../MediaPlayers/ShowMoreText';
import CreateComment from './CreateComment';
import { handleRequest, throwError, timeDifference } from '../../utils/helperFunctions';
import { LoginContext } from '../contexts/LoginContext';
import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/helperFunctions';
import { formatNumber } from '../../utils/helperFunctions';
import SmallMenu from './SmallMenu';
const Post = ({ type, postBody, createdAt, interactions, isRemeow, post_id, postedBy, commentsCount, setPosts, posts, JoinedRooms }) => {
  const { domain, userData, socket } = useContext(LoginContext);
  const [commentSection, setCommentSection] = useState(false);
  const [likeStatus, setLikeStatus] = useState(interactions.likes.isInteracted || false);
  const [saveStatus, setSaveStatus] = useState(interactions.saves.isInteracted || false);
  const [remeowStatus, setRemeowStatus] = useState(interactions.remeows.isInteracted || false);
  const [postLikesCount, setPostLikesCount] = useState(interactions.likes.count || 0);
  const [postSavesCount, setPostSavesCount] = useState(interactions.saves.count || 0);
  const [postRemeowsCount, setPostRemeowsCount] = useState(interactions.remeows.count || 0);
  const [postInteractionsCount, setPostInteractionsCount] = useState(interactions.saves.count + interactions.likes.count + interactions.remeows.count);
  const saveButtonRef = useRef();
  const likeButtonRef = useRef();
  const remeowButtonRef = useRef();

  //windows
  const [remeowWindow, setRemowWindow] = useState(false);

  const [errors, setErrors] = useState(null);

  const [isPfpLoading, setIsPfpLoading] = useState([true, true]);

  //commentsStuff
  const [comments, setComments] = useState([]);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [noMoreComments, setNoMoreComments] = useState(false);
  const fetchedCommentsIds = useRef(new Set());
  const commentsIntervalRef = useRef();

  //menus
  const [postMenu, setPostMenu] = useState(false);
  const [deletePostMenu, setDeletePostMenu] = useState(false);

  const postMenuRef = useRef();
  const postMenuBtnRef = useRef();

  const likeFetchIntervalRef = useRef();
  const saveFetchIntervalRef = useRef();

  //sockets
  const joinedRooms = useRef(JoinedRooms);

  const smallMenuRef = useRef();
  const fetchComments = async (commentsLimit) => {
    setIsLoadingComments(true);
    const request = new Request(`/api/posts/${post_id}/comments/loadComments?limit=${commentsLimit}`, {
      method: 'post',
      body: JSON.stringify({ fetchedComments: Array.from(fetchedCommentsIds.current) }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    let res;
    try {
      try {
        res = await fetch(request);
      } catch {
        throwError('Internet connection failure', 503);
      }
      try {
        let data;
        if (!res.ok) {
          data = await res.text();
          throwError(data || 'Unknown error occurred', res.status || 500);
        }
        data = await res.json();

        setComments((prev) => [...prev, ...data]);

        data.forEach((elem) => {
          fetchedCommentsIds.current.add(elem.comment_id);
        });

        if (commentsIntervalRef.current) {
          clearInterval(commentsIntervalRef.current);
          commentsIntervalRef.current = null;
        }

        setIsLoadingComments(false);
        if (data.length < commentsLimit) {
          setNoMoreComments(true);
        }
      } catch (err) {
        throwError(err.message || 'Unknown error occurred', err.status || 500);
      }
    } catch (err) {
      if (err.status === 503) {
        if (!commentsIntervalRef.current) {
          commentsIntervalRef.current = setInterval(() => {
            fetchComments(commentsLimit);
          }, 3000);
        }
      } else {
        clearInterval(commentsIntervalRef.current);
        commentsIntervalRef.current = null;
        setErrors({ status: err.status, message: err.message });
      }
    }
  };

  useEffect(() => {
    setNoMoreComments(false);
    setComments([]);
    fetchedCommentsIds.current.clear();
    if (commentsIntervalRef.current) {
      clearInterval(commentsIntervalRef.current);
      commentsIntervalRef.current = null;
    }
    if (commentSection) {
      fetchComments(3);
    }
  }, [commentSection]);

  useEffect(() => {
    if (!socket.current) return;

    const joinRoomIfNotConnected = () => {
      if (!joinedRooms.current.has(post_id)) {
        if (socket.current.connected) {
          socket.current.emit('joinPostRoom', post_id);
          joinedRooms.current.add(post_id); // Track the joined room
        }
      }
    };

    joinRoomIfNotConnected();

    const handleLikeSaveUpdate = (data) => {
      if (data.postId === post_id) {
        setPostLikesCount(data.likesCount);
        setPostSavesCount(data.savesCount);
        setPostRemeowsCount(data.remeowsCount);
        setPostInteractionsCount(data.totalInteractions);
      }
    };

    const handleCommentUpdate = (data) => {
      if (data.post_id === post_id) {
        setComments((prev) => [data, ...prev]);
        fetchedCommentsIds.current.add(data.comment_id);
      }
    };

    // Clean up existing listeners to prevent duplicates
    socket.current.off('comment', handleCommentUpdate);
    socket.current.off('like', handleLikeSaveUpdate);
    socket.current.off('save', handleLikeSaveUpdate);
    socket.current.off('remeow', handleLikeSaveUpdate);
    socket.current.off('connect', joinRoomIfNotConnected);

    // Set up listeners
    socket.current.on('comment', handleCommentUpdate);
    socket.current.on('like', handleLikeSaveUpdate);
    socket.current.on('save', handleLikeSaveUpdate);
    socket.current.on('remeow', handleLikeSaveUpdate);
    socket.current.on('connect', joinRoomIfNotConnected);

    return () => {
      socket.current.emit('leavePostRoom', post_id);
      joinedRooms.current.delete(post_id); // Remove the room from the Set
      socket.current.off('comment', handleCommentUpdate);
      socket.current.off('like', handleLikeSaveUpdate);
      socket.current.off('save', handleLikeSaveUpdate);
      socket.current.off('remeow', handleLikeSaveUpdate);
      socket.current.off('connect', joinRoomIfNotConnected);
    };
  }, [post_id, socket]);

  const likePost = async (e) => {
    likeButtonRef.current.style.pointerEvents = 'none';
    const isInteracted = e.target.checked;
    setLikeStatus(isInteracted);

    try {
      const request = new Request(`/api/posts/${post_id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isInteracted }),
      });

      const response = await fetch(request);
      if (likeFetchIntervalRef.current) clearInterval(likeFetchIntervalRef.current);
      if (!response.ok) {
        throw new Error('Failed to update like status');
      }
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        if (!likeFetchIntervalRef.current) {
          likeFetchIntervalRef.current = setInterval(() => {
            likePost(e);
          }, 2000);
        }
      }
    } finally {
      likeButtonRef.current.style.pointerEvents = 'all';
    }
  };

  const savePost = async (e) => {
    saveButtonRef.current.style.pointerEvents = 'none';
    const isInteracted = e.target.checked;
    setSaveStatus(isInteracted);

    try {
      const request = new Request(`/api/posts/${post_id}/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isInteracted }),
      });

      const res = await fetch(request);
      if (saveFetchIntervalRef.current) clearInterval(saveFetchIntervalRef.current);
      const data = await res.text();
      saveButtonRef.current.style.pointerEvents = 'all';

      if (!res.ok) {
        throw new Error('Failed to update like status');
      }
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        if (!saveFetchIntervalRef.current) {
          saveFetchIntervalRef.current = setInterval(() => {
            savePost(e);
          }, 2000);
        }
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (postMenu && postMenuRef.current && !postMenuRef.current.contains(e.target) && !postMenuBtnRef.current.contains(e.target)) {
        setPostMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [postMenu]);

  const handlePfpLoadStatus = (index) => {
    setIsPfpLoading((prev) => {
      let copy = [...prev];
      copy[index] = false;
      return copy;
    });
  };

  async function deletePost(setIsLoading, ref, onError) {
    await handleRequest(
      new Request(`/api/posts/${post_id}/deletePost`, {
        method: 'delete',
        credentials: 'same-origin',
      }),
      ref,
      setIsLoading,
      (data) => {
        const filteredPosts = posts.filter((post) => {
          return post.post_id != post_id;
        });
        setPosts(filteredPosts);
        setDeletePostMenu(false);
      },
      onError
    );
  }

  const [smallMenu, setSmallMenu] = useState(false);
  return (
    <>
      {remeowWindow && (
        <RemeowWindow
          setRemeowStatus={setRemeowStatus}
          postType={isRemeow.status ? isRemeow.originalPost.type : type}
          event={isRemeow.status ? isRemeow.originalPost.postBody.event : postBody.event}
          poll={isRemeow.status ? isRemeow.originalPost.postBody.poll : postBody.poll}
          text={isRemeow.status ? isRemeow.originalPost.postBody.text : postBody.text}
          video={isRemeow.status ? isRemeow.originalPost.postBody.video : postBody.video}
          image={isRemeow.status ? isRemeow.originalPost.postBody.image : postBody.image}
          since={isRemeow.status ? timeDifference(isRemeow.originalPost.createdAt) : timeDifference(createdAt)}
          postId={isRemeow.status ? isRemeow.originalPost.post_id : post_id}
          postedBy={isRemeow.status ? isRemeow.originalPost.postedBy : postedBy}
          userPfp={isRemeow.status ? isRemeow.originalPost.postedBy.pfp : postedBy.pfp}
          setPosts={setPosts}
          onClose={() => {
            setRemowWindow(false);
          }}
        />
      )}
      <div className="side-block post-container ">
        <header>
          {isPfpLoading[0] && <div className="skeleton-circle" style={{ width: '50px', height: '50px' }}></div>}
          <img
            className="post-pfp"
            src={`${domain}/LoadImage/pfp/${postedBy.userTag}`}
            onLoad={() => {
              handlePfpLoadStatus(0);
            }}
            style={{ display: isPfpLoading[0] ? 'none' : 'block' }}
          />
          <div className="post-info">
            <Link to={`/Mewtopia/${postedBy.userTag}`}>
              {postedBy.firstName} {postedBy.lastName}
            </Link>
            <span>{timeDifference(createdAt)}</span>
          </div>
          <div
            className="dots"
            ref={postMenuBtnRef}
            onClick={(e) => {
              setSmallMenu((prev) => !prev);
            }}>
            <svg style={{ minHeight: '22px', minWidth: '22px' }} clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.5 11.995c0-1.242 1.008-2.25 2.25-2.25s2.25 1.008 2.25 2.25-1.008 2.25-2.25 2.25-2.25-1.008-2.25-2.25zm-6.75 0c0-1.242 1.008-2.25 2.25-2.25s2.25 1.008 2.25 2.25-1.008 2.25-2.25 2.25-2.25-1.008-2.25-2.25zm-6.75 0c0-1.242 1.008-2.25 2.25-2.25s2.25 1.008 2.25 2.25-1.008 2.25-2.25 2.25-2.25-1.008-2.25-2.25z" />
            </svg>
          </div>

          {smallMenu && (
            <SmallMenu
              dataToDisplay={[
                { header: 'Posted by', value: `${postedBy.firstName} ${postedBy.lastName}` },
                { header: 'User tag', value: `${postedBy.userTag}` },
                { header: 'Posted At', value: formatDate(createdAt) },
                { header: 'Post Id', value: post_id },
              ]}
              onClose={() => {
                setSmallMenu(false);
              }}
              menuRef={smallMenuRef}
              shareUrl={`${window.location.href}posts/${post_id}`}
              menuBtnRef={postMenuBtnRef}
              deleteTarget={deletePost}
              warningMessage={{ title: 'Delete Post', message: 'Are you sure you want to delete this Post' }}
              targetOwned={postedBy.userTag === userData.userTag}
            />
          )}
        </header>
        <div className="post-content">
          {postBody.text && <ShowMoreText text={postBody.text} />}

          {isRemeow.status && (
            <div className="remeowed-post">
              <header>
                {isPfpLoading[1] && <div className="skeleton-circle" style={{ width: '35px', height: '35px' }}></div>}
                <img
                  className="post-pfp"
                  src={`${domain}/LoadImage/pfp/${isRemeow.originalPost.postedBy.userTag}`}
                  style={{ display: isPfpLoading[1] ? 'none' : 'block' }}
                  onLoad={() => {
                    handlePfpLoadStatus(1);
                  }}
                />
                <div className="post-info">
                  <Link to={`/Mewtopia/${isRemeow.originalPost.postedBy.userTag}`}>
                    {isRemeow.originalPost.postedBy.firstName} {isRemeow.originalPost.postedBy.lastName}
                  </Link>
                  <span>{timeDifference(isRemeow.originalPost.createdAt)}</span>
                </div>
              </header>
              {isRemeow.originalPost.postBody.text && <ShowMoreText text={isRemeow.originalPost.postBody.text} />}
              <PostContent rooms={joinedRooms.current} postId={post_id} image={isRemeow.originalPost.postBody.image} video={isRemeow.originalPost.postBody.video} event={isRemeow.originalPost.postBody.event} poll={isRemeow.originalPost.postBody.poll} postType={isRemeow.originalPost.type} id={isRemeow.originalPost.post_id} />
            </div>
          )}
          {!isRemeow.status && <PostContent rooms={joinedRooms.current} postId={post_id} image={postBody.image} video={postBody.video} event={postBody.event} poll={postBody.poll} postType={type} id={post_id} />}
        </div>
        {(!!postLikesCount || !!postRemeowsCount || !!postSavesCount || !!commentsCount) && (
          <div className="reactions-container">
            <div className="icons-container">
              {postLikesCount != 0 ? (
                <div className="icon-wrapper" title={postLikesCount} style={{ backgroundColor: 'var(--red)' }}>
                  <img src="/images/icons/paw.png" alt="" className="reaction-icon" />
                </div>
              ) : (
                ''
              )}
              {postRemeowsCount != 0 ? (
                <div className="icon-wrapper" title={postRemeowsCount} style={{ backgroundColor: 'var(--green)' }}>
                  <img src="/images/icons/repost.png" alt="" className="reaction-icon" />
                </div>
              ) : (
                ''
              )}

              {postSavesCount != 0 ? (
                <div className="icon-wrapper" title={postSavesCount} style={{ backgroundColor: 'var(--blue)' }}>
                  <img src="/images/icons/save.png" alt="" className="reaction-icon" />
                </div>
              ) : (
                ''
              )}
              <span>{postInteractionsCount != 0 ? `${formatNumber(postInteractionsCount)}` : ''}</span>
            </div>
            {!!commentsCount && (
              <span
                style={{
                  alignSelf: 'center',
                }}>{`${commentsCount === 1 ? `${commentsCount} Scratch` : `${formatNumber(commentsCount)} Scratches`} `}</span>
            )}
          </div>
        )}

        <div className="reaction-buttons-container">
          <label className="reaction-btn" ref={likeButtonRef}>
            <img src="/images/icons/paw.png" alt="" className={likeStatus ? 'paw' : ''} />
            <span>Purr</span>
            <input type="checkbox" style={{ display: 'none' }} defaultChecked={likeStatus} onChange={likePost} />
          </label>

          <label
            className="reaction-btn"
            onClick={() => {
              setRemowWindow(true);
            }}
            ref={remeowButtonRef}>
            <img src="/images/icons/repost.png" alt="" className={remeowStatus ? 'remeow' : ''} />
            <span>Remeow</span>
            <input type="checkbox" style={{ display: 'none' }} onChange={(e) => {}} />
          </label>

          <label
            className="reaction-btn"
            onClick={() => {
              setCommentSection((prev) => !prev);
            }}>
            <img src="/images/icons/claw.png" alt="" />
            <span>Scratch</span>
          </label>

          <label className="reaction-btn" ref={saveButtonRef}>
            <img src="/images/icons/save.png" alt="" className={saveStatus ? 'save' : ''} />
            <input type="checkbox" style={{ display: 'none' }} defaultChecked={saveStatus} onChange={savePost} />
            <span>Save</span>
          </label>
        </div>

        <div className="comments-section" style={commentSection ? {} : { display: 'none' }}>
          <CreateComment id={post_id} setComments={setComments} />

          <div className="comments-wrapper">
            {comments.map((comment) => (
              <Comment {...comment} key={comment.comment_id} comments={comments} setComments={setComments} />
            ))}
            {isLoadingComments && <Skeleton type={'comment-skeleton'} />}

            {!isLoadingComments && !comments.length && (
              <div className="so-empty-block">
                <span>Wow so empty</span>
                <svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24">
                  <path d="M23,6h-2.628c-.553,0-1.047-.33-1.258-.84-.212-.511-.096-1.093,.295-1.483l1.677-1.676h-1.086c-.553,0-1-.448-1-1s.447-1,1-1h2.628c.553,0,1.047,.33,1.258,.84,.212,.51,.096,1.092-.295,1.483l-1.677,1.676h1.086c.553,0,1,.447,1,1s-.447,1-1,1Zm-7.5,1h-1.382c-.012-.02-2.065-3.002-3.182-4.822-.533-.868-1.813-.801-2.256,.117l-.883,1.948c-1.402,.296-2.62,1.086-3.469,2.18H1.863c-1.01,0-1.628,1.11-1.094,1.968l3.22,4.812c1.053,1.677,2.915,2.797,5.037,2.797,3.28,0,5.974-2.719,5.974-6,0-.552,.448-1,1-1s1,.448,1,1c-.012,1.026-.245,2.149-.612,3.046,.204-.015,.404-.046,.612-.046h1c.552,0,1,.448,1,1s-.448,1-1,1h-1c-2.705,0-5.34,2.119-5.941,4.965,0,0,1.531,1.189,4.441,2.035-3.654,0-7.799-.092-10.24-4.378-.302-.67-.847-1.182-1.534-1.442-.689-.261-1.438-.237-2.106,.065-.67,.302-1.182,.847-1.442,1.534-.26,.688-.237,1.436,.066,2.106l.081,.141c2.765,3.972,7.207,3.972,12.636,3.972h2.538c4.687,0,8.5-3.813,8.5-8.5s-3.813-8.5-8.5-8.5Z" />
                </svg>
              </div>
            )}

            {!noMoreComments && (
              <h1
                className="glowing-link"
                onClick={() => {
                  fetchComments(6);
                }}>
                Show more
              </h1>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Post;
